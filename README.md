# irpg-map-src


Hello, thanks for checking this repo.
**This code is ugly.**
It was made as a proof of concept but was continued to be built without consideration for code cleanliness. Take care before reading this code.


## How to install

Clone this repo.
`git clone git@github.com:Tbotas/irpg-map-src.git`
`cd irpg-map-src`

Install the dependencies.
`npm install`

You should be good.

## How to build

For development:
`npm run build`

Everything should be good inside the `src` folder, you can start a simple http server on this folder to serve the public files.

For production:
`npm run build-prod`

The production bundle will be created in the `prod` folder. It needs to be copied inside a folder with all the public files (you can copy / paste `src` and replace the development `bundle.js`).



