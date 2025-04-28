<template>
  <div>
    <p class="text-sm font-semibold">Invitations</p>
    <div
      class="mt-2 overflow-x-auto rounded-lg border border-neutral-200 dark:divide-white/10 dark:border-white/10"
    >
      <table
        v-if="teamInvites?.length"
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
            v-for="invite in teamInvites"
            :key="invite.id"
            class="text-sm [&>td]:whitespace-nowrap"
          >
            <td class="px-4 py-3">{{ invite.email }}</td>
            <td class="px-4 py-3">
              <UBadge
                color="neutral"
                size="sm"
                variant="subtle"
                class="uppercase"
              >
                {{ invite.role }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              <UBadge
                :color="invite.status === 'pending' ? 'warning' : 'success'"
                size="sm"
                variant="subtle"
                class="uppercase"
              >
                {{ invite.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              {{ useDateFormat(invite.expiresAt, 'MMM D, YYYY').value }}
            </td>
            <td class="px-4 py-3">
              {{ useDateFormat(invite.createdAt, 'MMM D, YYYY').value }}
            </td>
            <td class="px-4 py-3">
              <UDropdownMenu
                :items="getRowItems(invite)"
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
      <div v-else class="flex h-64 flex-col items-center justify-center gap-3">
        <UIcon name="i-lucide-inbox" class="size-10" />
        <p class="text-sm text-neutral-500">No invitations found</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core'
import type { TeamInvite } from '@@/types/database'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { FetchError } from 'ofetch'

const { currentTeam, cancelInvite, resendInvite } = useTeam()
const toast = useToast()

const { data: teamInvites, refresh: fetchTeamInvites } = await useFetch<TeamInvite[]>(`/api/teams/${currentTeam.value.id}/invites`, {
  key: 'team-invites',
})

const columns = ['Email', 'Role', 'Status', 'Expires At', 'Created At', '']

const getRowItems = (invite: TeamInvite): DropdownMenuItem[] => {
  return [
    {
      label: 'Copy Email',
      onSelect: async () => {
        await navigator.clipboard.writeText(invite.email)
        toast.add({
          title: 'Email copied to clipboard!',
          color: 'success',
        })
      },
    },
    {
      label: 'Resend Invite',
      onSelect: async () => {
        try {
          await resendInvite(invite.id)
          toast.add({
            title: 'Invite resent successfully!',
            color: 'success',
          })
        } catch (error) {
          toast.add({
            title: 'Failed to resend invite',
            description: (error as FetchError).statusMessage,
            color: 'error',
          })
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Cancel Invite',
      color: 'error' as const,
      onSelect: async () => {
        try {
          await cancelInvite(invite.id)
          toast.add({
            title: 'Invite cancelled successfully',
            color: 'success',
          })
        } catch (error) {
          toast.add({
            title: 'Failed to cancel invite',
            description: (error as FetchError).statusMessage,
            color: 'error',
          })
        }

        await fetchTeamInvites()
      },
    },
  ]
}
</script>
