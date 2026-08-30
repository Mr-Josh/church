<?php

declare(strict_types=1);

function adminCrudRoute(PDO $db, string $path, string $method): void
{
    if (strpos($path, '/api/admin/') !== 0) return;
    $actor = requireRole($db, ['admin', 'developer']);
    if ($path === '/api/admin/users' || preg_match('#^/api/admin/users/(\d+)$#', $path, $userMatch)) {
        handleUserCrud($db, $actor, $method, isset($userMatch[1]) ? (int) $userMatch[1] : null);
        return;
    }
    if ($actor['role'] !== 'admin') jsonResponse(['message' => 'Developer accounts cannot access ministry administration resources.'], 403);

    if ($path === '/api/admin/events' && $method === 'GET') listAdminEvents($db);
    if ($path === '/api/admin/events' && $method === 'POST') createAdminEvent($db, requestBody());
    if (preg_match('#^/api/admin/events/(\d+)$#', $path, $eventMatch)) {
        $id = (int) $eventMatch[1];
        if ($method === 'GET') getAdminEvent($db, $id);
        if ($method === 'PATCH') updateAdminEvent($db, $id, requestBody());
        if ($method === 'DELETE') archiveAdminEvent($db, $id);
    }
    if (preg_match('#^/api/admin/events/(\d+)/photos$#', $path, $photoMatch)) {
        $eventId = (int) $photoMatch[1];
        if ($method === 'POST') createEventPhoto($db, $eventId, requestBody());
    }
    if (preg_match('#^/api/admin/event-photos/(\d+)$#', $path, $photoMatch)) {
        $id = (int) $photoMatch[1];
        if ($method === 'PATCH') updateEventPhoto($db, $id, requestBody());
        if ($method === 'DELETE') deleteEventPhoto($db, $id);
    }

    $resources = [
        'ministries' => 'ministries', 'event-photos' => 'event_photos', 'testimonials' => 'testimonials',
        'prayer-requests' => 'prayer_requests', 'help-requests' => 'help_requests', 'donations' => 'donations',
    ];
    foreach ($resources as $resource => $table) {
        $base = "/api/admin/{$resource}";
        if ($path === $base && $method === 'GET') {
            $stmt = $db->query("SELECT * FROM {$table} ORDER BY id DESC"); jsonResponse(['data' => $stmt->fetchAll()]);
        }
        if ($path === $base && $method === 'POST') createAdminResource($db, $resource, requestBody());
        if (preg_match('#^' . preg_quote($base, '#') . '/(\d+)$#', $path, $match)) {
            $id = (int) $match[1];
            if ($method === 'GET') { $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = ? LIMIT 1"); $stmt->execute([$id]); $row = $stmt->fetch(); if (!$row) jsonResponse(['message' => 'Resource not found.'], 404); jsonResponse(['data' => $row]); }
            if ($method === 'PATCH') updateAdminResource($db, $resource, $id, requestBody());
            if ($method === 'DELETE') { $stmt = $db->prepare("DELETE FROM {$table} WHERE id = ?"); $stmt->execute([$id]); jsonResponse(['message' => 'Resource deleted.']); }
        }
    }
    jsonResponse(['message' => 'Admin route not found.'], 404);
}

function listAdminEvents(PDO $db): never
{
    $stmt = $db->query("SELECT e.*, CASE WHEN e.archived_at IS NOT NULL THEN 'archived' WHEN NOW() < e.start_at THEN 'upcoming' WHEN NOW() <= e.end_at THEN 'ongoing' ELSE 'past' END AS event_state, (SELECT COUNT(*) FROM event_photos p WHERE p.event_id = e.id) AS photo_count FROM events e ORDER BY e.archived_at IS NULL DESC, e.start_at DESC, e.id DESC");
    $events = $stmt->fetchAll();
    foreach ($events as &$event) $event = decorateEventMedia($event);
    unset($event);
    jsonResponse(['data' => $events]);
}

function getAdminEvent(PDO $db, int $id): never
{
    $stmt = $db->prepare("SELECT e.*, CASE WHEN e.archived_at IS NOT NULL THEN 'archived' WHEN NOW() < e.start_at THEN 'upcoming' WHEN NOW() <= e.end_at THEN 'ongoing' ELSE 'past' END AS event_state FROM events e WHERE e.id = ? LIMIT 1");
    $stmt->execute([$id]); $event = $stmt->fetch();
    if (!$event) jsonResponse(['message' => 'Event not found.'], 404);
    $photos = $db->prepare('SELECT * FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC, id ASC');
    $photos->execute([$id]);
    $event['photos'] = $photos->fetchAll();
    jsonResponse(['data' => decorateEventMedia($event)]);
}

function eventSlug(string $title): string
{
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title) ?: $title;
    $slug = strtolower($slug); $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?: 'event';
    return trim($slug, '-');
}

function uniqueEventSlug(PDO $db, string $base, ?int $ignoreId = null): string
{
    $base = trim($base, '-') ?: 'event'; $slug = $base; $i = 2;
    while (true) {
        $sql = 'SELECT id FROM events WHERE slug = ?' . ($ignoreId ? ' AND id <> ?' : '') . ' LIMIT 1';
        $stmt = $db->prepare($sql); $ignoreId ? $stmt->execute([$slug, $ignoreId]) : $stmt->execute([$slug]);
        if (!$stmt->fetch()) return $slug;
        $slug = $base . '-' . $i++;
    }
}

function validateEventDates(array $data): array
{
    $start = trim((string) ($data['start_at'] ?? '')); $end = trim((string) ($data['end_at'] ?? ''));
    if ($start === '' || $end === '') jsonResponse(['message' => 'Les dates de début et de fin sont obligatoires.'], 422);
    $startTs = strtotime($start); $endTs = strtotime($end);
    if ($startTs === false || $endTs === false) jsonResponse(['message' => 'Format de date invalide.'], 422);
    if ($endTs < $startTs) jsonResponse(['message' => 'La date de fin doit être après la date de début.'], 422);
    return [date('Y-m-d H:i:s', $startTs), date('Y-m-d H:i:s', $endTs)];
}

function createAdminEvent(PDO $db, array $data): never
{
    $title = trim((string) ($data['title'] ?? ''));
    if ($title === '') jsonResponse(['message' => 'Le titre est obligatoire.'], 422);
    [$start, $end] = validateEventDates($data);
    $slug = uniqueEventSlug($db, eventSlug((string) ($data['slug'] ?? $title)));
    $status = (($data['status'] ?? 'published') === 'draft') ? 'draft' : 'published';
    $stmt = $db->prepare('INSERT INTO events (title, slug, description, image, event_date, start_at, end_at, location, status, is_featured, display_order, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)');
    $stmt->execute([$title, $slug, $data['description'] ?? null, $data['image'] ?? null, $start, $start, $start, $data['location'] ?? null, $status, !empty($data['is_featured']) ? 1 : 0, (int) ($data['display_order'] ?? 0)]);
    jsonResponse(['message' => 'Événement créé.', 'id' => (int) $db->lastInsertId(), 'slug' => $slug], 201);
}

function updateAdminEvent(PDO $db, int $id, array $data): never
{
    $oldImage = null;
    if (array_key_exists('image', $data)) {
        $current = $db->prepare('SELECT image FROM events WHERE id = ? LIMIT 1');
        $current->execute([$id]);
        $oldImage = $current->fetchColumn() ?: null;
    }

    $allowed = ['title','description','image','location','status','is_featured','display_order','slug']; $sets = []; $values = [];
    foreach ($allowed as $field) if (array_key_exists($field, $data)) {
        $sets[] = "{$field} = ?";
        $values[] = $field === 'is_featured' ? (!empty($data[$field]) ? 1 : 0) : ($field === 'display_order' ? (int) $data[$field] : $data[$field]);
    }
    if (array_key_exists('start_at', $data) || array_key_exists('end_at', $data)) {
        [$start, $end] = validateEventDates($data);
        $sets[] = 'start_at = ?'; $values[] = $start;
        $sets[] = 'end_at = ?'; $values[] = $end;
        $sets[] = 'event_date = ?'; $values[] = $start;
    }
    if (array_key_exists('slug', $data)) $values[array_search($data['slug'], $values, true)] = uniqueEventSlug($db, eventSlug((string) $data['slug']), $id);
    if (!$sets) jsonResponse(['message' => 'Aucun champ à modifier.'], 422);
    $values[] = $id;
    $stmt = $db->prepare('UPDATE events SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($values);

    if (array_key_exists('image', $data) && $oldImage && $oldImage !== $data['image'] && !mediaPathStillReferenced($db, $oldImage, $id, null)) {
        deleteMediaVariants($oldImage);
    }
    jsonResponse(['message' => 'Événement mis à jour.']);
}

function archiveAdminEvent(PDO $db, int $id): never
{
    $stmt = $db->prepare('UPDATE events SET archived_at = NOW(), status = \'draft\' WHERE id = ?'); $stmt->execute([$id]);
    jsonResponse(['message' => 'Événement archivé.']);
}

function createEventPhoto(PDO $db, int $eventId, array $data): never
{
    if (empty($data['image'])) jsonResponse(['message' => 'image est obligatoire.'], 422);
    $stmt = $db->prepare('INSERT INTO event_photos (event_id, image, caption, position, sort_order) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$eventId, $data['image'], $data['caption'] ?? null, $data['position'] ?? null, (int) ($data['sort_order'] ?? 0)]);
    jsonResponse(['message' => 'Photo ajoutée.', 'id' => (int) $db->lastInsertId()], 201);
}

function updateEventPhoto(PDO $db, int $id, array $data): never
{
    $oldImage = null;
    if (array_key_exists('image', $data)) {
        $current = $db->prepare('SELECT image FROM event_photos WHERE id = ? LIMIT 1');
        $current->execute([$id]);
        $oldImage = $current->fetchColumn() ?: null;
    }
    $allowed = ['image','caption','position','sort_order']; $sets=[]; $values=[];
    foreach ($allowed as $field) if (array_key_exists($field,$data)) { $sets[]="{$field} = ?"; $values[]=$field==='sort_order'?(int)$data[$field]:$data[$field]; }
    if (!$sets) jsonResponse(['message'=>'Aucun champ à modifier.'],422); $values[]=$id;
    $stmt=$db->prepare('UPDATE event_photos SET '.implode(', ',$sets).' WHERE id = ?'); $stmt->execute($values);
    if (array_key_exists('image', $data) && $oldImage && $oldImage !== $data['image'] && !mediaPathStillReferenced($db, $oldImage, null, $id)) deleteMediaVariants($oldImage);
    jsonResponse(['message'=>'Photo mise à jour.']);
}

function deleteEventPhoto(PDO $db, int $id): never
{
    $stmt = $db->prepare('SELECT image FROM event_photos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $image = $stmt->fetchColumn() ?: null;
    if (!$image) jsonResponse(['message' => 'Photo introuvable.'], 404);

    $delete = $db->prepare('DELETE FROM event_photos WHERE id = ?');
    $delete->execute([$id]);
    if (!mediaPathStillReferenced($db, $image, null, $id)) deleteMediaVariants($image);
    jsonResponse(['message'=>'Photo supprimée.']);
}

function mediaPathStillReferenced(PDO $db, string $path, ?int $eventId, ?int $photoId): bool
{
    $eventSql = 'SELECT COUNT(*) FROM events WHERE image = ?' . ($eventId !== null ? ' AND id <> ?' : '');
    $eventStmt = $db->prepare($eventSql);
    $eventId !== null ? $eventStmt->execute([$path, $eventId]) : $eventStmt->execute([$path]);
    if ((int) $eventStmt->fetchColumn() > 0) return true;

    $photoSql = 'SELECT COUNT(*) FROM event_photos WHERE image = ?' . ($photoId !== null ? ' AND id <> ?' : '');
    $photoStmt = $db->prepare($photoSql);
    $photoId !== null ? $photoStmt->execute([$path, $photoId]) : $photoStmt->execute([$path]);
    return (int) $photoStmt->fetchColumn() > 0;
}

function handleUserCrud(PDO $db, array $actor, string $method, ?int $targetId): never
{
    $role = $actor['role']; $tableRole = $role === 'developer' ? 'developer' : 'admin';
    if ($method === 'GET' && $targetId === null) { $stmt = $db->prepare('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE role = ? ORDER BY id DESC'); $stmt->execute([$role]); jsonResponse(['data' => $stmt->fetchAll()]); }
    if ($targetId !== null) {
        $target = getSameRoleUser($db, $targetId, $role); if (!$target) jsonResponse(['message' => 'User not found.'], 404);
        if ($method === 'GET') jsonResponse(['data' => $target]);
        if ($method === 'PATCH') {
            $data=requestBody();$sets=[];$values=[];
            if(array_key_exists('name',$data)){ $name=trim((string)$data['name']);if($name==='')jsonResponse(['message'=>'Name cannot be empty.'],422);$sets[]='name = ?';$values[]=$name; }
            if(array_key_exists('email',$data)){ $email=filter_var($data['email'],FILTER_VALIDATE_EMAIL);if(!$email)jsonResponse(['message'=>'A valid email is required.'],422);$sets[]='email = ?';$values[]=$email; }
            if(array_key_exists('is_active',$data)){ $active=(bool)$data['is_active'];if(!$active&&(int)$target['id']===(int)$actor['id'])jsonResponse(['message'=>'You cannot deactivate your own account.'],422);if(!$active&&isLastActiveRoleUser($db,$role,(int)$target['id']))jsonResponse(['message'=>"Cannot deactivate the last active {$tableRole} account."],409);$sets[]='is_active = ?';$values[]=$active?1:0; }
            if(!empty($data['password'])){if(strlen((string)$data['password'])<8)jsonResponse(['message'=>'Password must contain at least 8 characters.'],422);$sets[]='password = ?';$values[]=password_hash((string)$data['password'],PASSWORD_DEFAULT);}
            if(!$sets)jsonResponse(['message'=>'No fields to update.'],422);$values[]=(int)$target['id'];
            try{$stmt=$db->prepare('UPDATE users SET '.implode(', ',$sets).' WHERE id = ?');$stmt->execute($values);}catch(PDOException $e){if((int)$e->errorInfo[1]===1062)jsonResponse(['message'=>'This email is already in use.'],409);throw $e;}
            recordUserAudit($db,(int)$actor['id'],(int)$target['id'],'update');jsonResponse(['message'=>ucfirst($tableRole).' account updated.']);
        }
        if($method==='DELETE'){if((int)$target['id']===(int)$actor['id'])jsonResponse(['message'=>'You cannot delete your own account.'],422);if(isLastActiveRoleUser($db,$role,(int)$target['id']))jsonResponse(['message'=>"Cannot delete the last active {$tableRole} account."],409);$stmt=$db->prepare('DELETE FROM users WHERE id = ? AND role = ?');$stmt->execute([(int)$target['id'],$role]);recordUserAudit($db,(int)$actor['id'],(int)$target['id'],'delete');jsonResponse(['message'=>ucfirst($tableRole).' account deleted.']);}
    }
    if($method==='POST'&&$targetId===null){$data=requestBody();$email=filter_var($data['email']??'',FILTER_VALIDATE_EMAIL);$password=(string)($data['password']??'');$name=trim((string)($data['name']??''));if(!$email)jsonResponse(['message'=>'A valid email is required.'],422);if(strlen($password)<8)jsonResponse(['message'=>'Password must contain at least 8 characters.'],422);if($name==='')$name=$role==='developer'?'Developer':'Administrateur';$stmt=$db->prepare('INSERT INTO users (name,email,password,role,is_active) VALUES (?,?,?,?,1)');try{$stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT),$role]);}catch(PDOException $e){if((int)$e->errorInfo[1]===1062)jsonResponse(['message'=>'This email is already in use.'],409);throw $e;}$newId=(int)$db->lastInsertId();recordUserAudit($db,(int)$actor['id'],$newId,'create');jsonResponse(['message'=>ucfirst($tableRole).' account created.','id'=>$newId],201);}
    jsonResponse(['message'=>'Method not allowed.'],405);
}
function getSameRoleUser(PDO $db,int $id,string $role):?array{$stmt=$db->prepare('SELECT id,name,email,role,is_active,created_at,updated_at FROM users WHERE id = ? AND role = ? LIMIT 1');$stmt->execute([$id,$role]);return $stmt->fetch()?:null;}
function isLastActiveRoleUser(PDO $db,string $role,int $excludingId):bool{$stmt=$db->prepare('SELECT COUNT(*) FROM users WHERE role = ? AND is_active = 1 AND id <> ?');$stmt->execute([$role,$excludingId]);return (int)$stmt->fetchColumn()===0;}
function recordUserAudit(PDO $db,int $actorId,int $targetId,string $action):void{$stmt=$db->prepare('INSERT INTO user_admin_audit (actor_user_id,target_user_id,action) VALUES (?,?,?)');$stmt->execute([$actorId,$targetId,$action]);}

function createAdminResource(PDO $db,string $resource,array $data):never{
    $definitions=['ministries'=>['name','slug','description','image','status'],'event-photos'=>['event_id','image','caption','position','sort_order'],'testimonials'=>['name','content','photo','status']];
    if(!isset($definitions[$resource]))jsonResponse(['message'=>'This resource cannot be created here.'],405);$fields=$definitions[$resource];$table=$resource==='event-photos'?'event_photos':$resource;$values=array_map(fn($field)=>$data[$field]??null,$fields);
    if($resource==='event-photos'&&empty($data['event_id']))jsonResponse(['message'=>'event_id is required.'],422);if($resource==='event-photos'&&empty($data['image']))jsonResponse(['message'=>'image is required.'],422);
    $stmt=$db->prepare('INSERT INTO '.$table.' ('.implode(', ',$fields).') VALUES ('.implode(', ',array_fill(0,count($fields),'?')).')');$stmt->execute($values);jsonResponse(['message'=>'Resource created.','id'=>(int)$db->lastInsertId()],201);
}
function updateAdminResource(PDO $db,string $resource,int $id,array $data):never{
    $definitions=['ministries'=>['name','slug','description','image','status'],'event-photos'=>['event_id','image','caption','position','sort_order'],'testimonials'=>['name','content','photo','status'],'prayer-requests'=>['name','phone','email','subject','message','is_confidential','is_urgent','status'],'help-requests'=>['name','phone','message','status'],'donations'=>['name','phone','amount','type','payment_method','transaction_id','status']];
    $fields=$definitions[$resource]??[];if(!$fields)jsonResponse(['message'=>'This resource cannot be updated here.'],405);$table=$resource==='prayer-requests'?'prayer_requests':($resource==='help-requests'?'help_requests':($resource==='event-photos'?'event_photos':$resource));$sets=[];$values=[];foreach($fields as $field)if(array_key_exists($field,$data)){$sets[]="{$field} = ?";$values[]=$data[$field];}if(!$sets)jsonResponse(['message'=>'No fields to update.'],422);$values[]=$id;$stmt=$db->prepare('UPDATE '.$table.' SET '.implode(', ',$sets).' WHERE id = ?');$stmt->execute($values);jsonResponse(['message'=>'Resource updated.']);
}
