import { Tabs } from 'expo-router';
import { StateProvider } from "../StateContext";
import { View, Text } from "react-native";
import { useFonts } from 'expo-font'
import { useColorScheme } from 'react-native'
import { Plus, User, Vote, Coins } from '@tamagui/lucide-icons'
import { TamaguiProvider } from 'tamagui'
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

import config from '../../tamagui.config'

export default function Layout(props) {
  const colorScheme = useColorScheme()

  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <StateProvider>
        <View style={{ height: "100%" }}>
          <Tabs
            screenOptions={{
              headerShown: false,
            }}>
            <Tabs.Screen
              name="index"
              options={{
                href: null,
              }}
            />
            <Tabs.Screen
              name="proposals/new"
              options={{
                tabBarLabel: 'New Proposal',
                tabBarIcon: ({ color, size }) => (
                  <Plus size={28} style={{ marginTop: 3 }} color={'black'} />
                ),
                // href: null
              }}
            />
            <Tabs.Screen
              name="proposals/index"
              options={{
                tabBarLabel: 'All Proposals',
                tabBarIcon: ({ color, size }) => (
                  <Vote size={28} style={{ marginTop: 3 }} color={'black'} />
                ),
                // href: null
              }}
            />
            <Tabs.Screen
              name="proposals/[id]"
              options={{
                tabBarLabel: 'All Proposals',
                href: null
              }}
            />
            <Tabs.Screen
              name="account"
              options={{
                tabBarLabel: 'Account',
                tabBarIcon: ({ color, size }) => (
                  <User size={28} style={{ marginTop: 3 }} color={'black'} />
                ),
              }}
            />
          </Tabs>
        </View>
      </StateProvider>
    </TamaguiProvider>
  );
}