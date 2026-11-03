DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Authenticated update user avatars'
  ) THEN
    CREATE POLICY "Authenticated update user avatars" 
      ON storage.objects 
      FOR UPDATE 
      TO authenticated 
      USING (bucket_id = 'user-avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Authenticated delete user avatars'
  ) THEN
    CREATE POLICY "Authenticated delete user avatars" 
      ON storage.objects 
      FOR DELETE 
      TO authenticated 
      USING (bucket_id = 'user-avatars');
  END IF;
END $$;
