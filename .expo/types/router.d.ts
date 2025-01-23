/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/addtoplaylist` | `/(tabs)/artists` | `/(tabs)/favorites` | `/(tabs)/playlists` | `/_sitemap` | `/addtoplaylist` | `/artists` | `/favorites` | `/playlists`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
