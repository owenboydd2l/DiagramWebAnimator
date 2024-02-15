# Diagram Web Animator

## Description

JavaScript framework to add a layer of animation onto an in browser diagram (image)

## Usage

TBD

## Static Setup

The static HTML files require no setup and can be run in browser from the file system.

Static Files:
1. [index.html](index.html): Auto-load. No editor controls. Simulated surrounding content.
2. [index.dev.html](index.dev.html): Auto-load. Editor/Debug controls.
3. [legacymigration.html](legacyMigration.html): Auto-Load. Working example using code flow
4. [UploadDemo.html](UploadDemo.html): Allow user to upload an image file. Editor/Debug controls.

## Hosted Setup

1. Run npm install
    `npm install`
2. Run build
    `npm build`
3. Start server
    `npm run start`
    or
    `npm run start-dev`
4. Access default server page
    - [localhost:3000/static/index.server.html](http://localhost:3000/static/index.server.html)

### Hosted Dev Notes

The hosting system was created to support JavaScript modules. In order to allow modules the browser cannot access script files from the local file system (CORS errors).

The build script [modules.build.js](modules.build.js) is used to generate the hosted module files by searching for matching filenames that have ".excludes." and ".includes.". This results in not having to hand edit two sets of files on changes.

Exports and Includes are done manually (for now) although I'm sure there is a better system for doing this automatically.

## Class Diagram

![Class Diagram](./DiagramAnimator.png)