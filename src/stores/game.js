import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useRankingStore = defineStore('ranking', () => {
  const ranking = ref(null)

  // Get usernames with scores
  const fetchRanking = async () => {
    const { data: scores } = await supabase
      .from('scores')
      .select(
        `
        overall,
        users: user_id (username)
      `
      )
      .order('overall', { ascending: false })

    // Create a map to store the highest score for each user
    const userScores = new Map()

    scores.forEach((score) => {
      const username = score.users.username
      const overall = score.overall

      // If this user doesn't have a score yet or this score is higher than their current highest, update it
      if (!userScores.has(username) || overall > userScores.get(username)) {
        userScores.set(username, overall)
      }
    })

    // Convert the map to the desired output format
    const ranking = Array.from(userScores, ([username, overall]) => ({
      username,
      overall,
    }))

    return ranking
  }

  const saveScore = async (newScore) => {
    console.log(newScore)
    const { user_id, accuracy, wpm, overall } = newScore

    const { data: newScoreToAdd } = await supabase.from('scores').insert([
      {
        user_id: user_id,
        wpm: wpm.toFixed(2),
        acc: accuracy.toFixed(2),
        overall: overall.toFixed(2),
      },
    ])

    const { data: userDetails } = await supabase
      .from('users_details')
      .select()
      .eq('user_id', user_id)
      .single()

    if (overall > userDetails.highscore) {
      await supabase
        .from('users_details')
        .update({
          highscore: overall.toFixed(2),
          taken_tests: userDetails.taken_tests + 1,
          avg_wpm:
            userDetails.taken_tests === 0
              ? wpm.toFixed(2)
              : ((userDetails.avg_wpm + wpm) / 2).toFixed(2),
          avg_acc:
            userDetails.taken_tests === 0
              ? accuracy.toFixed(2)
              : ((userDetails.avg_acc + accuracy) / 2).toFixed(2),
        })
        .eq('user_id', user_id)
    } else {
      await supabase
        .from('users_details')
        .update({
          taken_tests: userDetails.taken_tests + 1,
          avg_wpm:
            userDetails.taken_tests === 0
              ? wpm.toFixed(2)
              : ((userDetails.avg_wpm + wpm) / 2).toFixed(2),
          avg_acc:
            userDetails.taken_tests === 0
              ? accuracy.toFixed(2)
              : ((userDetails.avg_acc + accuracy) / 2).toFixed(2),
        })
        .eq('user_id', user_id)
    }
  }

  return {
    fetchRanking,
    saveScore,
  }
})
