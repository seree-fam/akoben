// theme.ts
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { Button } from "./button";

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: mode('gray.100', 'gray.900')(props), // app background
      color: mode('gray.800', 'white')(props),
    },
  }),
};

const components = {
  Button,
  Box: {
    baseStyle: (props: any) => ({
      bg: mode('white', 'gray.800')(props),
      color: mode('gray.800', 'white')(props),
    }),
  },
  Heading: {
    baseStyle: (props: any) => ({
      color: mode('gray.800', 'white')(props),
    }),
  },
  Text: {
    baseStyle: (props: any) => ({
      color: mode('gray.800', 'white')(props),
    }),
  },
  Link: {
    baseStyle: (props: any) => ({
      color: mode('green.600', 'green.300')(props),
      _hover: {
        textDecoration: 'underline',
      },
    }),
  },
  Card: {
    baseStyle: (props: any) => ({
      bg: mode('white', 'gray.700')(props),
      color: mode('gray.800', 'white')(props),
      boxShadow: 'md',
    }),
  },
  
  Navbar: {
    baseStyle: (props: any) => ({
      bg: mode('white', 'gray.800')(props),
      color: mode('gray.800', 'white')(props),
    }),
  },
  Input: {
    baseStyle: (props: any) => ({
      field: {
        bg: mode('white', 'gray.800')(props),
        color: mode('gray.800', 'white')(props),
        borderColor: mode('gray.300', 'gray.600')(props),
        _hover: {
          borderColor: mode('gray.400', 'gray.500')(props),
        },
      },
    }),
  },
  FormLabel: {
    baseStyle: (props: any) => ({
      color: mode('gray.800', 'white')(props),
    }),
  },
  Badge: {
    baseStyle: (props: any) => ({
      bg: mode('gray.100', 'gray.700')(props),
      color: mode('gray.800', 'white')(props),
    }),
  },
  Alert: {
    baseStyle: (props: any) => ({
      container: {
        bg: mode('white', 'gray.800')(props),
        color: mode('gray.800', 'white')(props),
      },
    }),
  },
  // Add more components here as needed
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      100: "#FF0000",
    },
  },
  fonts: {
    body: "Open Sans, sans-serif",
  },
  styles,
  components,
});
