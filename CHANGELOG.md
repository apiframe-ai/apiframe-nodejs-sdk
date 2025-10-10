# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-09

### Added
- Initial release of Apiframe Node.js SDK
- **Midjourney Original API** support (imagine, upscale, vary, zoom, pan, blend, describe, reroll, inpaint, faceSwap, shorten, fetch)
- **Midjourney Pro API (MidjourneyAlt)** support with Fast & Turbo modes, seed support
- Flux AI image generation (Pro, Dev, Schnell variants)
- Ideogram image generation and manipulation
- Luma AI video generation
- Suno AI music generation
- Udio AI music creation
- Runway ML video generation (Gen-2, Gen-3)
- Kling AI video generation
- AI Photos (headshots, face swap, enhancement, background removal)
- Media upload and management
- Task management with polling and progress callbacks
- Comprehensive TypeScript type definitions
- Error handling with custom error classes
- Full documentation and examples

### Features
- Task polling with `waitFor()` method
- Progress callback support
- Configurable timeout and polling intervals
- Automatic error handling and retry logic
- Support for all major Apiframe services
- Environment variable support for API keys
- Complete type safety with TypeScript

[1.0.0]: https://github.com/apiframe/apiframe-nodejs-sdk/releases/tag/v1.0.0

