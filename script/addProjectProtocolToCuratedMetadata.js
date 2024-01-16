const metadata = require("../src/curated/metadata.json");

// const projects = [
//   ...new Set(Object.values(metadata).map(({ projectName }) => projectName)),
// ];

// console.log(projects);

const projects = [
  "Emblem Test",
  "Age of Chains",
  "Age of Rust",
  "AtOMo",
  "Bitcorns",
  "Bitcorn Mash",
  "Bitgirls",
  "CrystalsCraft",
  "Diecast",
  "Force of Will",
  "FootballCoin",
  "Gamicon",
  "Mafia Wars",
  "Memorychain",
  "Oasis Mining",
  "Penisium",
  "Rare Pepe",
  "Sarutobi Island",
  "Skara",
  "Spells of Genesis",
  "Fake Rares",
  "NILIcoins",
  "STAMPS",
  "StamPunks",
  "Fake Commons",
  "Dank Rares",
];

const Protocols = {
  Counterparty: "Counterparty",
  "Bitcoin Stamps": "Bitcoin Stamps",
};

const projectToProtocol = {
  "Emblem Test": Protocols.Counterparty,
  "Age of Chains": Protocols.Counterparty,
  "Age of Rust": Protocols.Counterparty,
  AtOMo: Protocols.Counterparty,
  Bitcorns: Protocols.Counterparty,
  "Bitcorn Mash": Protocols.Counterparty,
  Bitgirls: Protocols.Counterparty,
  CrystalsCraft: Protocols.Counterparty,
  Diecast: Protocols.Counterparty,
  "Force of Will": Protocols.Counterparty,
  FootballCoin: Protocols.Counterparty,
  Gamicon: Protocols.Counterparty,
  "Mafia Wars": Protocols.Counterparty,
  Memorychain: Protocols.Counterparty,
  "Oasis Mining": Protocols.Counterparty,
  Penisium: Protocols.Counterparty,
  "Rare Pepe": Protocols.Counterparty,
  "Sarutobi Island": Protocols.Counterparty,
  Skara: Protocols.Counterparty,
  "Spells of Genesis": Protocols.Counterparty,
  "Fake Rares": Protocols.Counterparty,
  NILIcoins: Protocols.Counterparty,
  STAMPS: Protocols.Counterparty,
  StamPunks: Protocols["Bitcoin Stamps"],
  "Fake Commons": Protocols.Counterparty,
  "Dank Rares": Protocols.Counterparty,
};

const addProjectProtocolToCuratedMetadata = async () => {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, "../src/curated/metadata.json");
  const fileContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
  Object.entries(fileContent).forEach(([key, value]) => {
    fileContent[key].projectProtocol = projectToProtocol[value.projectName];
  });
  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
};

addProjectProtocolToCuratedMetadata();
