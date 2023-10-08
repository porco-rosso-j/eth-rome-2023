import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { cardAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys)

// define custom styles for funky variant
const variants = {
  darkCard: definePartsStyle({
    container: {
      bg: 'gray.700',
      color: 'gray.200'
    }
  })
};

const cardTheme = defineMultiStyleConfig({ variants });
const chakraDefaultTheme = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: 'gray.800',
        color: 'white',
      },
      // styles for the `a`
      // a: {
      //   color: 'teal.500',
      //   _hover: {
      //     textDecoration: 'underline',
      //   },
      // },
    },

  },
  components: {
    Card: cardTheme
  }

})

export default chakraDefaultTheme