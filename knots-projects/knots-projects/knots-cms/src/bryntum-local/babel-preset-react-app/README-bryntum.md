# @bryntum/babel-preset-react-app
This repo is part of `create-react-app` fork localed at https://github.com/bryntum/create-react-app/tree/master/packages/babel-preset-react-app.

# Bryntum Repository access setup

This npm package requires access to Bryntum private NPM repository.
You must be logged-in to this repository as a licensed or trial user to access it.
Please check [Online npm repository guide](https://bryntum.com/docs/pkgname/#guides/npm-repository.md) for detailed information on the sign-up/login process.

# React demo performance

Bryntum React demo applications use CRA scripts for project compilation.
CRA by default use `@babel/plugin-transform-runtime` plugin to transpile application's *.js library dependencies.
This finally affects on built React application performance which is seriously degraded when used with Bryntum library where async function generators are widely used.

# Workaround

CRA has no build-in config options which allow to disable this behavior.
We have created our fork for CRA to fix this issue and disable unwanted library transpilation.
`dependencies.js` contains patched copy of original presets with disabled preset plugins.

# Browser compatibility notice

React application which is build with this preset patch will be incompatible with IE11 or non-chromium legacy Edge.

# Links 

Original CRA scripts 
https://github.com/facebook/create-react-app

Alternatives to Ejecting
https://create-react-app.dev/docs/alternatives-to-ejecting/

Customizing create-react-app: How to Make Your Own Template
https://auth0.com/blog/how-to-configure-create-react-app/

# Online References

* [React Framework](https://github.com/facebook/create-react-app)
* [Bryntum React integration guide](https://bryntum.com/docs/pkgOnlineName#guides/integration/react.md)
* [pkgName documentation](https://bryntum.com/docs/pkgOnlineName)
* [Bryntum pkgName Examples](https://bryntum.com/examples/pkgOnlineName)
* [Bryntum npm repository guide](https://bryntum.com/docs/pkgname/#guides/npm-repository.md)
* [Bryntum support Forum](https://bryntum.com/forum)
* [Contacts us](https://www.bryntum.com/contact)
