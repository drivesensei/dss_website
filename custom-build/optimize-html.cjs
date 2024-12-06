const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'dist', 'index.html');
const classMappingsFile = path.join(__dirname, 'clsm.json')

if (!fs.existsSync(indexFile) || !fs.existsSync(classMappingsFile))
  console.error('index.html or classMappings doesn\'t exist')

const fileName = fs.readFileSync(indexFile, 'utf-8')

const classMappings = JSON.parse(fs.readFileSync(classMappingsFile, 'utf-8'));

let html = fileName

Object
  .keys(classMappings)
  .sort(
    (b,c) => b.length < c.length ? 1 : -1
  )
  .forEach(
    (originalClass) => {
    const regex = new RegExp(`\\b${originalClass}\\b`, 'g');
    html = html.replace(regex, classMappings[originalClass]);
  })

fs.writeFileSync(
  indexFile,
  html
);
