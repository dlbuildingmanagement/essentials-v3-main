<template>
  <div>
    <p class="text-sm font-semibold">Active Members</p>
    <div
      class="mt-2 overflow-x-auto rounded-lg border border-neutral-200 dark:divide-white/10 dark:border-white/10"
    >
      <table
        class="min-w-full divide-y divide-neutral-200 dark:divide-white/10"
      >
        <thead>
          <tr class="text-sm">
            <th
              v-for="column in columns"
              :key="column"
              class="px-4 py-3 text-left text-sm font-semibold"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-white/10">
          <tr
            v-for="member in members"
            :key="member.id"
            class="text-sm [&>td]:whitespace-nowrap"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <UAvatar
                  v-if="member.avatarUrl"
                  :src="
                    getAvatarUrl({
                      path: member.avatarUrl,
                      identifier: member.email,
                      type: 'user',
                    })
                  "
                  size="xs"
                  :alt="member.name"
                />
                <span class="font-medium text-neutral-900 dark:text-white">{{
                  member.name
                }}</span>
              </div>
            </td>
            <td class="px-4 py-3">{{ member.email }}</td>
            <td class="px-4 py-3">
              <UBadge
                size="sm"
                variant="subtle"
                class="uppercase"
                :color="member.role === 'owner' ? 'success' : 'neutral'"
              >
                {{ member.role }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              {{
                member.lastLoginAt
                  ? useDateFormat(member.lastLoginAt, 'MMM D, YYYY hh:mm a')
                    .value
                  : 'Never'
              }}
            </td>
            <td class="px-4 py-3">
              {{ useDateFormat(member.createdAt, 'MMM D, YYYY').value }}
            </td>
            <td class="px-4 py-3">
              <UDropdownMenu
                :items="getRowItems(member)"
                :content="{
                  align: 'end',
                  side: 'bottom',
                }"
              >
                <UButton
                  icon="i-lucide-ellipsis"
                  variant="ghost"
                  color="neutral"
                />
              </UDropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDateFormat } from '@vueuse/core'
import { getAvatarUrl } from '@/utils/avatar'
import type { DropdownMenuItem } from '@nuxt/ui'

const { currentTeam, removeTeamMember } = useTeam()
interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: string
  email: string
  name: string
  avatarUrl: string | null
  lastLoginAt: Date | null
  createdAt: Date
}
const { data: members, refresh: refreshMembers } = await useFetch<TeamMember[]>(
  `/api/teams/${currentTeam.value.id}/members`,
)
const columns = ['Name', 'Email', 'Role', 'Last Login', 'Created At']
const toast = useToast()
const getRowItems = (member: TeamMember): DropdownMenuItem[] => {
  return [
    {
      label: 'Copy Email',
      onSelect: async () => {
        await navigator.clipboard.writeText(member.email)
        toast.add({
          title: 'Email copied to clipboard!',
          color: 'success',
        })
      },
    },
    {
      label: 'Copy User ID',
      onSelect: async () => {
        await navigator.clipboard.writeText(member.userId)
        toast.add({
          title: 'User ID copied to clipboard!',
          color: 'success',
        })
      },
    },
    { type: 'separator' },
    {
      label: 'Remove from team',
      color: 'error' as const,
      onSelect: async () => {
        try {
          await removeTeamMember(member.id)
          await refreshMembers()
        } catch {
          toast.add({
            title: 'Failed to remove member',
            color: 'error',
          })
        }
      },
    },
  ]
}
</script>
