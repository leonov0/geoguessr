<template>
  <UApp>
    <UHeader title="GeoGuessr" to="/">
      <template #left>
        <nav class="flex items-center gap-2">
          <UButton to="/play" variant="ghost" size="sm">Play Game</UButton>
          <UButton to="/leaderboard" variant="ghost" size="sm"
            >Leaderboard</UButton
          >
        </nav>
      </template>
      <template #right>
        <HeaderAuth />
      </template>
      <template #body>
        <nav class="flex flex-col gap-1 p-2">
          <UButton to="/play" variant="ghost" block>Play Game</UButton>
          <UButton to="/leaderboard" variant="ghost" block>Leaderboard</UButton>
        </nav>
        <USeparator />
        <div class="p-2">
          <HeaderAuth />
        </div>
      </template>
    </UHeader>
    <UMain>
      <UContainer class="py-12">
        <slot />
      </UContainer>
    </UMain>
  </UApp>
</template>
