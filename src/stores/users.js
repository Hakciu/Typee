import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useUserStore = defineStore('user', () => {
  const errorMessage = ref('')
  const user = ref(null)

  // Validate email
  const validateMail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  // Register
  const handleRegister = async (credentials) => {
    const { username, email, password } = credentials
    // Check username
    if (username.length < 3) {
      errorMessage.value = 'Username is too short'
      return
    }

    const specialChars = /[!@#$%^&*(),.?":{}|<>]/g
    if (specialChars.test(username)) {
      errorMessage.value = 'Username cannot contain special characters'
      return
    }

    // Check email
    if (!validateMail(email)) {
      errorMessage.value = 'Invalid email'
      return
    }

    // Check password
    if (password.length < 8) {
      errorMessage.value =
        'Password is too short. It must be at least 8 characters long'
      return
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .or(`username.eq.${username}`, `email.eq.${email}`)

    if (existingUser.length > 0) {
      errorMessage.value = 'User with this username or email already exists'
      return
    }

    // User does not exist
    errorMessage.value = ''

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      errorMessage.value = error.message
      return
    }

    // Add user to database
    await supabase.from('users').insert({ username, email })

    const { data: newUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single()

    user.value = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      created_at: newUser.created_at,
    }

    await supabase.from('users_details').insert({
      user_id: newUser.id,
      taken_tests: 0,
      highscore: 0,
      avg_acc: 0,
      avg_wpm: 0,
    })
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  // Get user
  // const getUser = async () => {
  //   const { data, error } = await supabase.auth.getUser()

  //   console.log(data)

  //   if (!error) {
  //     const { data: userWithEmail } = await supabase
  //       .from('users')
  //       .select()
  //       .eq('email', data.user.email)
  //       .maybeSingle()

  //     user.value = {
  //       id: userWithEmail.id,
  //       email: userWithEmail.email,
  //       username: userWithEmail.username,
  //       created_at: userWithEmail.created_at,
  //     }
  //   }
  // }

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser()

    // console.log(data)

    if (!error) {
      if (data.user.app_metadata.provider === 'discord') {
        const { data: userWithDiscord } = await supabase
          .from('users')
          .select()
          .eq('email', data.user.email)
          .maybeSingle()

        user.value = {
          id: userWithDiscord.id,
          email: userWithDiscord.email,
          username: userWithDiscord.username,
          created_at: userWithDiscord.created_at,
        }
      } else {
        const { data: userWithEmail } = await supabase
          .from('users')
          .select()
          .eq('email', data.user.email)
          .maybeSingle()

        user.value = {
          id: userWithEmail.id,
          email: userWithEmail.email,
          username: userWithEmail.username,
          created_at: userWithEmail.created_at,
        }
      }
    }
  }

  // Login
  const handleLogin = async (credentials) => {
    const { email, password } = credentials

    // Check email
    if (!validateMail(email)) {
      errorMessage.value = 'Invalid email'
      return
    }

    // Check password
    if (password.length < 8) {
      errorMessage.value = 'Password is required'
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    const { data: userWithEmail } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single()

    user.value = {
      id: userWithEmail.id,
      email: userWithEmail.email,
      username: userWithEmail.username,
      created_at: userWithEmail.created_at,
    }

    errorMessage.value = ''
  }

  const handleDiscordLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    })

    if (error) {
      return
    }
  }

  const handleAddDiscordUser = async () => {
    const { data, error } = await supabase.auth.getSession()

    // console.log(data.session.user.user_metadata)
    let username = data.session.user.user_metadata.full_name
    let email = data.session.user.email
    let photoUrl = data.session.user.user_metadata.avatar_url

    // console.log('username:', username)
    // console.log('email:', email)
    // console.log('photoUrl:', photoUrl)

    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)

    if (existingUser.length > 0) {
      return
    }

    await supabase.from('users').insert({ username, email })

    const { data: newUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single()

    user.value = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      created_at: newUser.created_at,
    }

    await supabase.from('users_details').insert({
      user_id: newUser.id,
      taken_tests: 0,
      highscore: 0,
      avg_acc: 0,
      avg_wpm: 0,
    })

    // Zdjęcie
    const fileName = Math.floor(Math.random() * 1000000000000000000)

    // Sprawdź, czy użytkownik ma już zdjęcie profilowe
    const { data: existingImage, error: existingImageError } = await supabase
      .from('profile_pictures')
      .select('url')
      .eq('owner_id', newUser.id)
      .single()

    // Jeśli użytkownik ma już zdjęcie profilowe, usuń je
    if (existingImage && existingImage.url) {
      await supabase.storage.from('images').remove([existingImage.url])
      await supabase
        .from('profile_pictures')
        .delete()
        .eq('owner_id', newUser.id)
    }

    // Pobierz zdjęcie z Discorda
    const response = await fetch(photoUrl)
    const blob = await response.blob()

    // Prześlij zdjęcie do storage
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`public/${fileName}`, blob)

    if (uploadError) {
      console.error('Error during photo upload:', uploadError)
      return
    }

    // Dodaj URL do zdjęcia do bazy danych
    const { data: inserted, error: insertError } = await supabase
      .from('profile_pictures')
      .insert({
        url: uploaded.path,
        owner_id: newUser.id,
      })
  }

  return {
    handleRegister,
    handleLogin,
    handleLogout,
    getUser,
    handleDiscordLogin,
    handleAddDiscordUser,
    errorMessage,
    user: computed(() => user.value),
  }
})
