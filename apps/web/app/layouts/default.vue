<template>
  <UApp>
    <UHeader title="GeoGuessr" to="/">
      <template #right>
        <HeaderAuth />
      </template>
      <template #body>
        <HeaderAuth />
      </template>
    </UHeader>
    <UMain>
      <UContainer class="py-12">
        <slot />
      </UContainer>
    </UMain>
  </UApp>
</template>
