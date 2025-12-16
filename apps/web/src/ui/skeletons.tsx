import { Grid, Flex } from '@strapi/design-system';

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function MenuSkeleton() {
  return (
    <Grid.Item
      col={3}
      direction={'column'}
      alignItems={'flex-start'}
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={'8px'}>
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
      </Flex>
      <Flex direction={'column'} alignItems={'flex-start'} gap={'4px'}>
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='h-5 w-5 rounded-md bg-gray-200' />
      </Flex>
      <Flex direction={'column'} alignItems={'flex-start'} gap={'24px'}>
        <div className='ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium' />
        <div className='ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium' />
      </Flex>
    </Grid.Item>
  );
}
