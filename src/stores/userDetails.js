import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useUserDetailsStore = defineStore('userDetails', () => {
  const user = ref(null)
  const user_id = ref(null)
  const photoUrl = ref(null)

  // Get user details
  const fetchUserDetails = async (username) => {
    const { data } = await supabase
      .from('users')
      .select('id, created_at, username')
      .eq('username', username)

    user.value = data
    user_id.value = data[0].id
    // console.log('user_id', user_id.value)

    const { data: userData } = await supabase
      .from('users_details')
      .select('taken_tests, highscore, avg_acc, avg_wpm')
      .eq('user_id', user_id.value)

    // console.log('userData', userData)

    const { data: userPhoto } = await supabase
      .from('profile_pictures')
      .select()
      .eq('owner_id', user_id.value)

    if (userPhoto.length > 0) {
      photoUrl.value = `https://knbtgryzmlbekvvzhmmb.supabase.co/storage/v1/object/public/images/${userPhoto[0].url}`
    } else {
      photoUrl.value = `https://knbtgryzmlbekvvzhmmb.supabase.co/storage/v1/object/public/images/public/default.png`
    }

    // console.log('userPhoto', photoUrl.value)

    const { data: userScores } = await supabase
      .from('scores')
      .select()
      .eq('user_id', user_id.value)

    // console.log('userScores', userScores)

    // Create userDetails object
    const userDetails = {
      user: user,
      userData: userData,
      photoUrl: photoUrl.value,
      userScores: userScores,
    }

    return userDetails
  }

  const uploadPhoto = async (file, user_id) => {
    const fileName = Math.floor(Math.random() * 1000000000000000000)

    // Sprawdź, czy użytkownik ma już zdjęcie profilowe
    const { data: existingImage, error: existingImageError } = await supabase
      .from('profile_pictures')
      .select('url')
      .eq('owner_id', user_id)
      .single()

    // Jeśli użytkownik ma już zdjęcie profilowe, usuń je
    if (existingImage && existingImage.url) {
      await supabase.storage.from('images').remove([existingImage.url])
      await supabase.from('profile_pictures').delete().eq('owner_id', user_id)
    }

    // Prześlij nowe zdjęcie
    const { data, error } = await supabase.storage
      .from('images')
      .upload('public/' + fileName, file)

    // Dodaj nowe zdjęcie do bazy danych
    const response = await supabase.from('profile_pictures').insert({
      url: data.path,
      owner_id: user_id,
    })
  }

  return {
    fetchUserDetails,
    uploadPhoto,
  }
})
