const bannerModules = import.meta.glob('./*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const bannerImages: string[] = Object.keys(bannerModules)
  .sort()
  .map((path) => bannerModules[path])
