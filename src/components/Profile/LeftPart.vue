<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { NSpin, NButton, NUpload, NModal, NText } from 'naive-ui'
  import { useUserStore } from '@/stores/users'
  import { useUserDetailsStore } from '@/stores/userDetails'
  const route = useRoute()
  const router = useRouter()
  let localUser = ref(null)
  const MyProfile = ref(null)
  const photoUrl = ref(
    'https://knbtgryzmlbekvvzhmmb.supabase.co/storage/v1/object/public/images/public/default.png'
  )
  const fileList = ref([])
  const imageFile = ref(null)
  const loadingPhoto = ref(false)

  const errorMessage = ref('')
  const error = ref(false)

  const showModal = ref(false)
  const userStore = useUserStore()
  const userDetailsStore = useUserDetailsStore()

  const handleLogout = () => {
    userStore.handleLogout()
    router.push('/')
  }

  const props = defineProps({
    userProfile: Object,
    loading: Boolean,
    isMyProfile: Boolean,
  })

  const submitCallback = async () => {
    if (fileList.value.length > 0) {
      loadingPhoto.value = true
      await userDetailsStore.uploadPhoto(
        imageFile.value.file,
        localUser.value.user[0].id
      )
      errorMessage.value = ''
      loadingPhoto.value = false
      showModal.value = false
      fileList.value = []
      window.location.reload()
    } else {
      error.value = true
      errorMessage.value = 'You have to upload a file.'
    }
  }

  const cancelCallback = () => {
    fileList.value = []
    showModal.value = false
    errorMessage.value = ''
  }

  onMounted(async () => {
    localUser.value = props.userProfile
    MyProfile.value = props.isMyProfile
    await userStore.getUser()
  })

  const handleFileListUpdate = (newFileList) => {
    if (newFileList.length > 1) {
      error.value = true
      errorMessage.value = 'You can only upload one file.'
      newFileList.pop()
    } else {
      fileList.value = newFileList
      error.value = false
    }
  }

  watch(
    () => props.userProfile,
    async (newUser) => {
      localUser.value = newUser
      photoUrl.value = newUser.photoUrl
      MyProfile.value = props.isMyProfile
    }
  )

  watch(fileList, (newFileList) => {
    if (newFileList.length > 0) {
      const file = newFileList[0]
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        imageFile.value = file
      } else {
        fileList.value = []
        error.value = true
        errorMessage.value = 'Only .jpg and .png files are allowed.'
      }
    }
  })
</script>
<template>
  <div class="leftPart">
    <div class="avatar">
      <img :src="photoUrl" alt="avatar" />
      <div v-if="loading">
        <n-spin size="small" class="size" />
      </div>
      <div v-else class="size">
        <h3>
          {{ localUser.user[0].username }}
        </h3>
      </div>
      <div v-if="isMyProfile">
        <button class="btn2 upload" @click="showModal = true">
          Upload photo
        </button>
        <n-modal
          class="uploadModal"
          v-model:show="showModal"
          preset="dialog"
          title="Upload photo"
          style="text-align: center; background-color: #2e343e; color: #eceef5"
          :show-icon="false"
        >
          <template #default>
            <n-upload @update:file-list="handleFileListUpdate">
              <n-button v-if="!loadingPhoto">Click to upload</n-button>
              <n-spin v-else size="small" class="size" />
            </n-upload>
            <n-text type="warning" v-if="Error">{{ errorMessage }}</n-text>
            <div class="buttons">
              <button class="btn-cancel" @click="cancelCallback">Cancel</button>
              <button
                class="btn-submit"
                @click="submitCallback"
                :disabled="loadingPhoto"
              >
                Submit
              </button>
            </div>
          </template>
        </n-modal>
      </div>
    </div>

    <div class="date">
      <h3>Date of registration:</h3>
      <div v-if="loading">
        <n-spin size="small" class="size" />
      </div>
      <div v-else class="size">
        <h3>
          {{
            new Date(localUser.user[0].created_at).toLocaleDateString(
              'pl-PL',
              {}
            )
          }}
        </h3>
      </div>
    </div>

    <div class="taken_tests">
      <h3>Number of tests:</h3>
      <div v-if="loading">
        <n-spin size="small" class="size" />
      </div>
      <div v-else class="size">
        <h3>
          {{ localUser.userData[0].taken_tests }}
        </h3>
      </div>
    </div>

    <div class="button">
      <button v-if="MyProfile" class="btn2" @click="handleLogout">
        Log out
      </button>
    </div>
  </div>
</template>

<style scoped>
  .leftPart {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    padding: 2rem;
    background-color: #262a35;
    border-radius: 5rem;
    height: 100%;
    font-size: 1.3rem;
    text-align: center;
  }

  .avatar {
    margin-bottom: 2rem;
    height: 13rem;
  }

  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 5px solid #99c279;
  }

  .size {
    height: 50px;
  }

  .button {
    height: 20px;
  }

  .upload {
    font-size: 1rem;
  }

  .buttons {
    display: flex;
    margin-top: 1rem;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  span {
    font-size: 1rem;
    font-weight: bold;
  }

  .btn-submit,
  .btn-cancel {
    font-size: 1rem;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5rem;
    cursor: pointer;
    font-weight: bold;
    height: 50px;
  }

  .btn-submit {
    background-color: #99c279;
    color: #262a35;
  }

  .btn-cancel {
    background-color: #e06d74;
    color: #262a35;
  }

  .btn-submit:hover {
    background-color: #7e9e5e;
  }

  .btn-cancel:hover {
    background-color: #c94a4e;
  }

  .btn-submit:disabled {
    background-color: #99c279;
    color: #262a35;
    cursor: not-allowed;
  }

  @media screen and (max-width: 768px) {
    .leftPart {
      font-size: 1rem;
      gap: 2rem;
      padding: 2rem 5rem 4rem 5rem;
    }
  }
</style>
