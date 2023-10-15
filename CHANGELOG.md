### 0.6.0 (2023-10-15)

##### New Features

- add real prop translations for shorthands (thanks @kaceycleveland) ([ee56aaaa](https://github.com/nderscore/tamagui-typescript-plugin/commit/ee56aaaa586218daea62ebbc79496bfe5d1f1a13))

#### 0.5.4 (2023-08-27)

##### Bug Fixes

- avoid calling getProgram during initialization ([adb57ded](https://github.com/nderscore/tamagui-typescript-plugin/commit/adb57ded9017953db1ca7f459d9eb1a67b2e3ab0))

##### Refactors

- improved prop/value extraction and tamagui component detection ([f78ef9ea](https://github.com/nderscore/tamagui-typescript-plugin/commit/f78ef9ea191e7c6356d29bb35bbe587abce0db6d))

#### 0.5.3 (2023-08-24)

##### Bug Fixes

- use original quick info result if no tamagui token found ([e8b38534](https://github.com/nderscore/tamagui-typescript-plugin/commit/e8b3853485f34bac6de2cff90c0da95329909eb4))

#### 0.5.2 (2023-08-22)

##### Bug Fixes

- prop type detection in nested styles (psuedostates/media) ([4bd02e1c](https://github.com/nderscore/tamagui-typescript-plugin/commit/4bd02e1c7048984d20723c897dc949df240df487))

#### 0.5.1 (2023-08-20)

##### Bug Fixes

- hide true in all scales when showTrueTokens=false ([68a8b073](https://github.com/nderscore/tamagui-typescript-plugin/commit/68a8b073d4e9991982947b8aa1ccd3679ca34ad5))

### 0.5.0 (2023-08-19)

##### New Features

- add option for custom autocomplete filters ([282c2149](https://github.com/nderscore/tamagui-typescript-plugin/commit/282c21491aded667b23ec9764568d7c2ea830c94))
- add option showTrueTokens, allows filtering true and -true space/size tokens from autocomplete ([50ff939f](https://github.com/nderscore/tamagui-typescript-plugin/commit/50ff939fea227e20ede2315222a618bd9a2e96ed))
- add option showColorTokens, allows filtering color tokens from autocomplete results ([3026cc33](https://github.com/nderscore/tamagui-typescript-plugin/commit/3026cc3310017b85eb949129e63d18f1240315fe))
- add configuration option colorTileSize, default is now 18 ([da977ad6](https://github.com/nderscore/tamagui-typescript-plugin/commit/da977ad6c0053dbcb932d678482573ff8313e00b))
- replace rounded square tiles with squircles ([97d558f4](https://github.com/nderscore/tamagui-typescript-plugin/commit/97d558f4c7e9e660c031040369330f8b09b7912e))

### 0.4.0 (2023-08-18)

##### New Features

- group themes by parent in previews ([d6c8883d](https://github.com/nderscore/tamagui-typescript-plugin/commit/d6c8883d971a50fcb9f556b8b2d56573b721bedf))
- sort default theme first in previews ([d9a3d9ea](https://github.com/nderscore/tamagui-typescript-plugin/commit/d9a3d9eaba83978d3c6c1a03d90b9613846ffa1d))

##### Bug Fixes

- theme token sorting ([d959172d](https://github.com/nderscore/tamagui-typescript-plugin/commit/d959172dc6ea510b1fc77dc275df53cec082be4f))
- highlight only the token value string on hover ([4be5ee40](https://github.com/nderscore/tamagui-typescript-plugin/commit/4be5ee40a3111836f590fd15482dd1c3cfa775f3))
- prevent completion error if default theme is missing ([24038bdf](https://github.com/nderscore/tamagui-typescript-plugin/commit/24038bdf937090afc4f3e566c35bdc12c516fb4f))

##### Performance Improvements

- improve AST walking performance ([0241c27b](https://github.com/nderscore/tamagui-typescript-plugin/commit/0241c27b6e9bdf07a369c22c41fa012cbbfd7c90))

#### 0.3.1 (2023-08-16)

##### Bug Fixes

- fix quick info on JSX props ([2404d22f](https://github.com/nderscore/tamagui-typescript-plugin/commit/2404d22ff7e3c85911b77d0f29fa0dbbf20f9429))

### 0.3.0 (2023-08-16)

##### New Features

- token previews on hover (quick info) ([afca5d9d](https://github.com/nderscore/tamagui-typescript-plugin/commit/afca5d9d17bcd9b4d71216fb471ca75cf5da8834))

##### Bug Fixes

- tighten token sorting rules and specific token detection ([df293dc1](https://github.com/nderscore/tamagui-typescript-plugin/commit/df293dc19bdaed5fabe4e23b73cdfbce47b0edad))

### 0.2.0 (2023-08-15)

##### New Features

- smart sorting of all tokens ([334cf22d](https://github.com/nderscore/tamagui-typescript-plugin/commit/334cf22d40cf1475a9240e517fdb8a84bb553bec))
- sort size/space tokens in numeric order, sort negative tokens last ([ccff2671](https://github.com/nderscore/tamagui-typescript-plugin/commit/ccff26712783a0dbddbd16861291b63b9f3f2072))
- color icon for theme and color tokens ([91b526bb](https://github.com/nderscore/tamagui-typescript-plugin/commit/91b526bb27da7d5c03f4fc9b5f9cef334669b1b7))

##### Bug Fixes

- improve support for specific tokens ([71ed0d26](https://github.com/nderscore/tamagui-typescript-plugin/commit/71ed0d26675ed45d3dae958ba6cc110547c26f08))

### 0.1.0 (2023-08-13)

Initial release.
