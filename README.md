Testing Rendering locally:
1. npx vite

How To Deploy the Rendering Engine To Ipfs
1. Upload all static assets to ipfs
2. Get the hash and use https gateway
3. Update the url in index.html to the ipfs location
4. npx vite build
5. upload the dist/index.html file to ipfs
6. note the index.html ipfs hash

Deploying Nft
0. set the `animation_url` to the step.6
1. npx thirdweb login
2. npx thirdweb build
3. npx thirdweb deploy
 --follow instructions for ER721 Drop
1. create NFT
2. claim condition
3. claim nft

Appendix

Convert GLTF to GLB
- https://sbtron.github.io/makeglb/

Fonts
- if font doesnt work, convert to TTF online instead of use facetype.js to generate json 

Latest Build:
https://testnets.opensea.io/assets/base-goerli/0xddbd86b3661b973e1a72c7c70b2ea6a1bd445e21/1
