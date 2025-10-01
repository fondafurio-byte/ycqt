import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createGuestUser() {
  try {
    // 0. Verifica se l'utente guest esiste già
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'guest@youtcourt.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Errore durante la verifica dell\'utente esistente:', checkError);
      throw checkError;
    }

    if (existingUser) {
      console.log('Utente guest già esistente, procedo con la cancellazione...');
      
      // Elimina il profilo esistente
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('email', 'guest@youtcourt.com');

      if (deleteProfileError) {
        console.error('Errore durante l\'eliminazione del profilo:', deleteProfileError);
        throw deleteProfileError;
      }

      // Elimina l'utente auth
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteAuthError) {
        console.error('Errore durante l\'eliminazione dell\'utente auth:', deleteAuthError);
        throw deleteAuthError;
      }
    }

    // 1. Crea l'utente guest
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'guest@youtcourt.com',
      password: 'guest123',
      options: {
        data: {
          role: 'guest'
        }
      }
    })

    if (userError) {
      console.error('Errore durante la creazione dell\'utente:', userError);
      throw userError;
    }
    if (!userData.user) throw new Error('Errore nella creazione dell\'utente guest')

    console.log('Utente guest creato con successo')

    // 2. Cerca o crea la società demo per l'utente guest
    let societaData;
    
    // Prima cerca se esiste già
    const { data: existingSocieta, error: searchError } = await supabase
      .from('societa_sportive')
      .select()
      .eq('nome_completo', 'YoutCourt Guest Society')
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingSocieta) {
      societaData = existingSocieta;
      console.log('Società guest esistente trovata');
    } else {
      // Se non esiste, creala
      const { data: newSocieta, error: societaError } = await supabase
        .from('societa_sportive')
        .insert([
          {
            nome_completo: 'YoutCourt Guest Society',
            nome_breve: 'Guest',
            token: 'GUEST123'
          }
        ])
        .select()
        .single();

      if (societaError) throw societaError;
      societaData = newSocieta;
      console.log('Nuova società guest creata');
    }

    console.log('Società guest creata con successo')

    // 3. Crea il profilo guest
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userData.user.id,
          email: 'guest@youtcourt.com',
          username: 'guest',
          full_name: 'Utente Guest',
          role: 'guest', // Cambiato da 'user' a 'guest' per coerenza
          societa_id: societaData.id,
          categories: '[]'
        }
      ])

    if (profileError) {
      console.error('Errore durante la creazione del profilo:', profileError);
      throw profileError;
    }

    // 4. Verifica che l'utente sia stato creato correttamente
    const { data: finalCheck, error: finalCheckError } = await supabase
      .from('profiles')
      .select('*, societa_sportive(*)')
      .eq('email', 'guest@youtcourt.com')
      .single();

    if (finalCheckError) {
      console.error('Errore durante la verifica finale:', finalCheckError);
      throw finalCheckError;
    }

    console.log('Verifica finale utente guest:', finalCheck);
    console.log('Profilo guest creato con successo');
    console.log('Creazione utente guest completata!');

  } catch (error) {
    console.error('Errore durante la creazione dell\'utente guest:', error)
  }
}

createGuestUser()