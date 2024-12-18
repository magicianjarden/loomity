export const slideThemes = {
  default: {
    name: 'Default',
    background: 'bg-white',
    text: 'text-gray-900',
    heading: 'text-gray-900',
    accent: 'bg-blue-500',
  },
  dark: {
    name: 'Dark',
    background: 'bg-gray-900',
    text: 'text-gray-100',
    heading: 'text-white',
    accent: 'bg-blue-400',
  },
  minimal: {
    name: 'Minimal',
    background: 'bg-gray-50',
    text: 'text-gray-800',
    heading: 'text-gray-900',
    accent: 'bg-gray-200',
  },
  vibrant: {
    name: 'Vibrant',
    background: 'bg-gradient-to-br from-purple-500 to-pink-500',
    text: 'text-white',
    heading: 'text-white',
    accent: 'bg-yellow-400',
  },
  nature: {
    name: 'Nature',
    background: 'bg-gradient-to-br from-green-500 to-emerald-500',
    text: 'text-white',
    heading: 'text-white',
    accent: 'bg-amber-400',
  },
};

export const slideTransitions = {
  none: {
    name: 'None',
    enter: '',
    leave: '',
  },
  fade: {
    name: 'Fade',
    enter: 'animate-fade-in',
    leave: 'animate-fade-out',
  },
  slide: {
    name: 'Slide',
    enter: 'animate-slide-in-right',
    leave: 'animate-slide-out-left',
  },
  zoom: {
    name: 'Zoom',
    enter: 'animate-zoom-in',
    leave: 'animate-zoom-out',
  },
  flip: {
    name: 'Flip',
    enter: 'animate-flip-in',
    leave: 'animate-flip-out',
  },
};
