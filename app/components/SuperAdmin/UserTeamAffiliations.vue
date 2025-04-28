<template>
  <UPopover v-if="teamMembers?.length" mode="hover">
    <div class="flex cursor-pointer items-center gap-1">
      <span>{{ teamMembers.length }}</span>
      <UIcon name="i-lucide-users" class="text-neutral-500" />
    </div>
    <template #content>
      <div class="w-72 px-4 py-2">
        <div class="space-y-4">
          <div
            v-for="teamMember in teamMembers"
            :key="teamMember.id"
            class="flex items-center gap-3"
          >
            <UAvatar
              :src="teamMember.team.logo || undefined"
              size="sm"
              :alt="teamMember.team.name + ' logo'"
            />
            <div>
              <p class="text-sm font-medium">
                {{ teamMember.team.name }}
              </p>
              <p class="text-xs text-neutral-500">
                <span class="capitalize">{{ teamMember.role }}</span>
                {{
                  teamMember.role === 'owner'
                    ? ''
                    : `(Owner: ${getTeamOwnerName(teamMember.team.ownerId)})`
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
  <span v-else>-</span>
</template>

<script lang="ts" setup>
defineProps<{
  teamMembers?: {
    id: string
    teamId: string
    userId: string
    role: string
    createdAt: string
    updatedAt: string
    team: {
      id: string
      name: string
      ownerId: string
      logo: string
      slug: string
      createdAt: string
      updatedAt: string
    }
  }[]
  getTeamOwnerName: (ownerId: string) => string
}>()
</script>
