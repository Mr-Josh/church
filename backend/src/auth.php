<?php
function startSession(): void { if (session_status() !== PHP_SESSION_ACTIVE) session_start(); }
function requireAuth(): int { startSession(); if (empty($_SESSION['user_id'])) jsonResponse(['message'=>'Authentication required.'], 401); return (int) $_SESSION['user_id']; }
