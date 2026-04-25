USE helsebygg_auth;
UPDATE user_account SET password_hash = 'HASH_FOR_KARI'   WHERE username = 'kari';
UPDATE user_account SET password_hash = 'HASH_FOR_OLA'    WHERE username = 'ola';
UPDATE user_account SET password_hash = 'HASH_FOR_INGRID' WHERE username = 'ingrid';
