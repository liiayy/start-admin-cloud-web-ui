import { setSettings } from '@fantastic-admin/settings'

export default setSettings({
  app: {
    account: {
      auth: true,
    },
    dynamicTitle: true,
    routeBaseOn: 'backend',
    copyright: {
      enable: true,
      dates: '2020-present',
      company: 'Start-Admin',
      website: 'https://fantastic-admin.hurui.me',
    },
  },
  menu: {
    mode: 'single',
    mainMenuClickMode: 'smart',
    subMenuCollapseButton: true,
    hotkeys: true,
  },
  topbar: {
    tabbar: true,
    toolbar: true,
    mode: 'fixed',
  },
  tabbar: {
    icon: true,
    hotkeys: true,
  },
  toolbar: {
    fullscreen: true,
    pageReload: true,
    colorScheme: true,
  },
})
