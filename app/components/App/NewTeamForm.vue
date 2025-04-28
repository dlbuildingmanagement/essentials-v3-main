<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit as any"
  >
    <UFormField
      label="Team logo (Recommended size: 1 MB, 1:1 aspect ratio)"
      name="logo"
    >
      <AppAvatarUploader
        v-model="imagePreview"
        @file-selected="handleFileSelected"
      />
    </UFormField>

    <UFormField required label="Team name" name="name">
      <UInput
        v-model="state.name"
        placeholder="Personal or Company Name"
        class="w-full"
        size="lg"
      />
    </UFormField>

    <UFormField
      label="Team URL"
      name="slug"
      required
      :help="`${host}/dashboard/${state.slug}`"
    >
      <UInput
        v-model="state.slug"
        placeholder="my-awesome-team"
        class="w-full"
        size="lg"
      />
    </UFormField>

    <UButton
      color="neutral"
      type="submit"
      size="lg"
      block
      :loading="loading"
      :disabled="loading"
    >
      Create team
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { Team } from '@@/types/database'
import { FetchError } from 'ofetch'

const toast = useToast()
const teams = useState<Team[]>('teams')
const loading = ref(false)
const imagePreview = ref<string | undefined>(undefined)
const selectedFile = ref<File | null>(null)
const { setLastUsedTeam } = useTeamPreferences()

const emit = defineEmits<{
  success: [team: Team]
}>()

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
}

const schema = z.object({
  name: z.string().min(1, 'Team name is required'),
  logo: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Team slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and single hyphens between characters allowed',
    ),
})

const state = reactive({
  name: '',
  slug: '',
  logo: '',
})

const onSubmit = async (event: FormSubmitEvent<typeof schema>) => {
  loading.value = true
  const data = schema.parse(event.data)
  try {
    const filePath = selectedFile.value
      ? await uploadLogo()
      : `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(data.name)}`
    const teamData = { ...data, logo: filePath }
    const newTeam = await $fetch<Team>('/api/teams', {
      method: 'POST',
      body: teamData,
    })
    teams.value.push(newTeam)
    setLastUsedTeam(newTeam.slug)
    toast.add({
      title: 'Team created successfully',
      color: 'success',
    })
    emit('success', newTeam)
  } catch (error) {
    toast.add({
      title: 'Failed to create team',
      description:
        (error as any).message
        || (error as any).statusMessage
        || 'Please try again',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const uploadLogo = async () => {
  try {
    if (!selectedFile.value) return ''
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    const filePath = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    return `/images/${filePath}`
  } catch (error) {
    if (error instanceof FetchError) {
      throw new Error(`Failed to upload logo: ${error.message}`, {
        cause: error,
      })
    } else {
      console.error(error)
      throw new Error('Failed to upload logo', { cause: error })
    }
  }
}

const host = useRuntimeConfig().public.host
</script>
