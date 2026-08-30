<?php

declare(strict_types=1);

function handleAdminUpload(PDO $db, array $config): never
{
    requireRole($db, ['admin']);
    if (empty($_FILES['file']) || !is_array($_FILES['file'])) jsonResponse(['message' => 'Aucun fichier reçu. Utilisez le champ file.'], 422);
    $file=$_FILES['file'];
    if (($file['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK) jsonResponse(['message'=>'Échec du téléversement (code '.(int)($file['error']??0).').'],422);
    $maxBytes=(int)(getenv('UPLOAD_MAX_BYTES')?:8*1024*1024);
    if (($file['size']??0)<=0||($file['size']??0)>$maxBytes) jsonResponse(['message'=>'Fichier trop volumineux (max '.round($maxBytes/1024/1024,1).' Mo).'],422);
    $tmp=(string)($file['tmp_name']??'');if($tmp===''||!is_uploaded_file($tmp))jsonResponse(['message'=>'Fichier temporaire invalide.'],422);
    $finfo=new finfo(FILEINFO_MIME_TYPE);$mime=$finfo->file($tmp)?:'';
    $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];if(!isset($allowed[$mime]))jsonResponse(['message'=>'Format non supporté. Utilisez JPG, PNG ou WebP.'],422);

    $rawFolder=(string)($_POST['folder']??'events');
    $parts=array_values(array_filter(explode('/',$rawFolder),fn($part)=>$part!==''&&$part!=='.'&&$part!=='..'));
    $safeParts=[];foreach($parts as $part){$safe=preg_replace('/[^a-z0-9_-]/i','-', $part)??'';$safe=trim(preg_replace('/-+/','-',$safe),'-');if($safe!=='')$safeParts[]=$safe;}
    if(!$safeParts)$safeParts=['events'];
    $folder=implode('/',$safeParts);
    $dir=__DIR__.'/../public/uploads/'.$folder;
    if(!is_dir($dir)&&!mkdir($dir,0755,true)&&!is_dir($dir))jsonResponse(['message'=>'Impossible de créer le dossier uploads.'],500);

    $filename=date('Ymd-His').'-'.bin2hex(random_bytes(5)).'.'.$allowed[$mime];
    $destination=$dir.DIRECTORY_SEPARATOR.$filename;
    $optimized=false;
    if(function_exists('imagecreatefromjpeg')&&function_exists('imagewebp')){
        $source=@match($mime){'image/jpeg'=>imagecreatefromjpeg($tmp),'image/png'=>imagecreatefrompng($tmp),'image/webp'=>imagecreatefromwebp($tmp),default=>false};
        if($source){
            $maxWidth=(int)(getenv('UPLOAD_MAX_WIDTH')?:1920);$width=imagesx($source);$height=imagesy($source);
            if($width>$maxWidth){$newHeight=(int)round($height*$maxWidth/$width);$resized=imagecreatetruecolor($maxWidth,$newHeight);imagealphablending($resized,false);imagesavealpha($resized,true);imagecopyresampled($resized,$source,0,0,0,0,$maxWidth,$newHeight,$width,$height);imagedestroy($source);$source=$resized;}
            $filename=date('Ymd-His').'-'.bin2hex(random_bytes(5)).'.webp';$destination=$dir.DIRECTORY_SEPARATOR.$filename;$optimized=@imagewebp($source,$destination,82);imagedestroy($source);
        }
    }
    if(!$optimized&&!move_uploaded_file($tmp,$destination))jsonResponse(['message'=>'Impossible d’enregistrer le fichier.'],500);

    $relative='/uploads/'.$folder.'/'.$filename;$appUrl=rtrim((string)($config['app_url']??'http://localhost:8000'),'/');
    jsonResponse(['message'=>'Fichier téléversé.','data'=>['path'=>$relative,'url'=>$appUrl.$relative,'mime'=>$optimized?'image/webp':$mime,'size'=>(int)($file['size']??0),'optimized'=>$optimized]],201);
}
