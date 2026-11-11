// Symbology catalogue for the Zint web app.
// ids match the BARCODE_* constants in backend/zint.h.
//
// Fields:
//   id       Zint symbology number
//   name     Display name
//   example  Valid sample data (verified by `npm test`)
//   gs1      true when the symbology expects GS1 data, e.g. "(01)12345678901231"
//   primary  true when a second "primary data" field is needed (composites, MaxiCode)
//   opts     Names of symbology-specific controls (see OPTION_DEFS)

export const GROUPS = [
  'Popular',
  'Linear (1D)',
  'Retail & GS1',
  'GS1 Composite',
  '2D Matrix & Stacked',
  'Healthcare (HIBC)',
  'Postal',
];

const S = (id, name, group, example, extra = {}) => ({ id, name, group, example, ...extra });

export const SYMBOLOGIES = [
  // ---- Linear ----
  S(20, 'Code 128', 'Linear (1D)', 'Zint Barcode 128'),
  S(60, 'Code 128 (no set C)', 'Linear (1D)', 'Zint Barcode 128'),
  S(8, 'Code 39', 'Linear (1D)', 'ZINT-39', { opts: ['checkDigit'] }),
  S(9, 'Extended Code 39', 'Linear (1D)', 'Zint-39', { opts: ['checkDigit'] }),
  S(25, 'Code 93', 'Linear (1D)', 'ZINT93'),
  S(129, 'Code 32 (Italian Pharmacode)', 'Linear (1D)', '14352312'),
  S(18, 'Codabar', 'Linear (1D)', 'A12345B', { opts: ['checkDigit'] }),
  S(1, 'Code 11', 'Linear (1D)', '123-4567', { opts: ['code11Check'] }),
  S(3, '2 of 5 Interleaved', 'Linear (1D)', '1234567890', { opts: ['checkDigit'] }),
  S(2, '2 of 5 Standard (Matrix)', 'Linear (1D)', '123456789', { opts: ['checkDigit'] }),
  S(4, '2 of 5 IATA', 'Linear (1D)', '1234567890', { opts: ['checkDigit'] }),
  S(6, '2 of 5 Data Logic', 'Linear (1D)', '123456', { opts: ['checkDigit'] }),
  S(7, '2 of 5 Industrial', 'Linear (1D)', '123456', { opts: ['checkDigit'] }),
  S(50, 'LOGMARS', 'Linear (1D)', 'LOGMARS1', { opts: ['checkDigit'] }),
  S(47, 'MSI Plessey', 'Linear (1D)', '1234567', { opts: ['msiCheck'] }),
  S(86, 'UK Plessey', 'Linear (1D)', '1234ABCD'),
  S(32, 'Telepen Alpha', 'Linear (1D)', 'Telepen1'),
  S(87, 'Telepen Numeric', 'Linear (1D)', '1234567890'),
  S(51, 'Pharmacode One-Track', 'Linear (1D)', '131070'),
  S(53, 'Pharmacode Two-Track', 'Linear (1D)', '12345678'),
  S(52, 'PZN (Pharmazentralnummer)', 'Linear (1D)', '2758089'),
  S(49, 'FIM (Facing Identification Mark)', 'Linear (1D)', 'A'),
  S(28, 'Flattermarken', 'Linear (1D)', '1234567'),
  S(140, 'Channel Code', 'Linear (1D)', '1234'),
  S(146, 'IBM BC412', 'Linear (1D)', '1234567'),
  S(147, 'DX Film Edge', 'Linear (1D)', '113-10/11A'),
  S(73, 'VIN (Vehicle Identification)', 'Linear (1D)', '1M8GDM9AXKP042788'),
  S(21, 'Deutsche Post Leitcode', 'Linear (1D)', '9212320967145'),
  S(22, 'Deutsche Post Identcode', 'Linear (1D)', '91250800001'),
  S(96, 'DPD Code', 'Linear (1D)', '%007110123456789012345678901'),
  S(120, 'UPU S10', 'Linear (1D)', 'EE876543216CA'),

  // ---- Retail & GS1 ----
  S(15, 'EAN-13', 'Retail & GS1', '123456789012'),
  S(10, 'EAN-8', 'Retail & GS1', '1234567'),
  S(11, 'EAN-2 add-on', 'Retail & GS1', '12'),
  S(12, 'EAN-5 add-on', 'Retail & GS1', '12345'),
  S(13, 'EAN (legacy, auto)', 'Retail & GS1', '123456789012'),
  S(14, 'EAN with check digit (legacy)', 'Retail & GS1', '1234567890128'),
  S(34, 'UPC-A', 'Retail & GS1', '01234567890'),
  S(35, 'UPC-A with check digit', 'Retail & GS1', '012345678905'),
  S(37, 'UPC-E', 'Retail & GS1', '1234567'),
  S(38, 'UPC-E with check digit', 'Retail & GS1', '12345670'),
  S(69, 'ISBN', 'Retail & GS1', '9783161484100'),
  S(72, 'EAN-14', 'Retail & GS1', '9501101530003'),
  S(89, 'ITF-14', 'Retail & GS1', '0950110153000'),
  S(75, 'NVE-18 (SSCC-18)', 'Retail & GS1', '37612345000001021'),
  S(16, 'GS1-128', 'Retail & GS1', '(01)12345678901231(10)ABC123', { gs1: true }),
  S(29, 'GS1 DataBar Omnidirectional', 'Retail & GS1', '0950110153001'),
  S(30, 'GS1 DataBar Limited', 'Retail & GS1', '0950110153001'),
  S(31, 'GS1 DataBar Expanded', 'Retail & GS1', '(01)98898765432106(3202)012345(15)991231', { gs1: true }),
  S(79, 'GS1 DataBar Stacked', 'Retail & GS1', '0950110153001'),
  S(80, 'GS1 DataBar Stacked Omni', 'Retail & GS1', '0950110153001'),
  S(81, 'GS1 DataBar Expanded Stacked', 'Retail & GS1', '(01)98898765432106(3202)012345(15)991231', { gs1: true, opts: ['dbarCols'] }),

  // ---- GS1 Composite ----
  S(149, 'EAN-13 Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '331234567890', opts: ['ccType'] }),
  S(148, 'EAN-8 Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '1234567', opts: ['ccType'] }),
  S(135, 'UPC-A Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '12345678901', opts: ['ccType'] }),
  S(136, 'UPC-E Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '1234567', opts: ['ccType'] }),
  S(131, 'GS1-128 Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '(01)03312345678903', opts: ['ccType'] }),
  S(132, 'DataBar Omnidirectional Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '0950110153001', opts: ['ccType'] }),
  S(133, 'DataBar Limited Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '0950110153001', opts: ['ccType'] }),
  S(134, 'DataBar Expanded Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '(01)98898765432106(3202)012345(15)991231', opts: ['ccType'] }),
  S(137, 'DataBar Stacked Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '0950110153001', opts: ['ccType'] }),
  S(138, 'DataBar Stacked Omni Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '0950110153001', opts: ['ccType'] }),
  S(139, 'DataBar Expanded Stacked Composite', 'GS1 Composite', '(21)A1B2C3D4E5F6G7H8', { gs1: true, primary: '(01)98898765432106(3202)012345(15)991231', opts: ['ccType'] }),

  // ---- 2D ----
  S(58, 'QR Code', '2D Matrix & Stacked', 'https://zint.org.uk', { opts: ['qrEcc', 'qrVersion', 'fullMultibyte'] }),
  S(97, 'Micro QR Code', '2D Matrix & Stacked', '12345', { opts: ['mqrEcc', 'mqrVersion'] }),
  S(145, 'Rectangular Micro QR (rMQR)', '2D Matrix & Stacked', 'Zint rMQR', { opts: ['rmqrEcc', 'rmqrVersion'] }),
  S(143, 'UPNQR', '2D Matrix & Stacked', '1234567890AB', { opts: ['qrVersion'] }),
  S(71, 'Data Matrix', '2D Matrix & Stacked', 'Zint Data Matrix', { opts: ['dmSize', 'dmShape'] }),
  S(119, 'Royal Mail 2D Mailmark', '2D Matrix & Stacked', 'JGB 01Z999999900000001EC1A1AA1A0SN35TQ'),
  S(92, 'Aztec Code', '2D Matrix & Stacked', 'Zint Aztec Code', { opts: ['aztecEcc', 'aztecSize'] }),
  S(128, 'Aztec Runes', '2D Matrix & Stacked', '123'),
  S(55, 'PDF417', '2D Matrix & Stacked', 'Zint PDF417', { opts: ['pdfEcc', 'pdfCols'] }),
  S(56, 'Compact PDF417', '2D Matrix & Stacked', 'Zint PDF417', { opts: ['pdfEcc', 'pdfCols'] }),
  S(84, 'MicroPDF417', '2D Matrix & Stacked', 'Zint MicroPDF417', { opts: ['mpdfCols'] }),
  S(57, 'MaxiCode', '2D Matrix & Stacked', 'Zint MaxiCode', { opts: ['maxiMode'], primary: '' }),
  S(115, 'DotCode', '2D Matrix & Stacked', 'Zint DotCode', { opts: ['dotcodeCols'] }),
  S(116, 'Han Xin Code', '2D Matrix & Stacked', 'Zint Han Xin', { opts: ['hxEcc', 'hxVersion', 'fullMultibyte'] }),
  S(142, 'Grid Matrix', '2D Matrix & Stacked', 'Zint Grid Matrix', { opts: ['gmEcc', 'gmVersion', 'fullMultibyte'] }),
  S(141, 'Code One', '2D Matrix & Stacked', 'Zint Code One', { opts: ['c1Version'] }),
  S(144, 'Ultracode', '2D Matrix & Stacked', 'Zint Ultracode', { opts: ['ultraEcc'] }),
  S(74, 'Codablock-F', '2D Matrix & Stacked', 'Zint Codablock-F', { opts: ['cbfRows', 'cbfCols'] }),
  S(23, 'Code 16K', '2D Matrix & Stacked', 'Zint Code 16K'),
  S(24, 'Code 49', '2D Matrix & Stacked', 'ZINT CODE 49'),

  // ---- HIBC ----
  S(98, 'HIBC Code 128', 'Healthcare (HIBC)', 'A123BJC5D6E71'),
  S(99, 'HIBC Code 39', 'Healthcare (HIBC)', 'A123BJC5D6E71'),
  S(102, 'HIBC Data Matrix', 'Healthcare (HIBC)', 'A123BJC5D6E71', { opts: ['dmSize', 'dmShape'] }),
  S(104, 'HIBC QR Code', 'Healthcare (HIBC)', 'A123BJC5D6E71', { opts: ['qrEcc', 'qrVersion'] }),
  S(106, 'HIBC PDF417', 'Healthcare (HIBC)', 'A123BJC5D6E71', { opts: ['pdfEcc', 'pdfCols'] }),
  S(108, 'HIBC MicroPDF417', 'Healthcare (HIBC)', 'A123BJC5D6E71', { opts: ['mpdfCols'] }),
  S(110, 'HIBC Codablock-F', 'Healthcare (HIBC)', 'A123BJC5D6E71'),
  S(112, 'HIBC Aztec Code', 'Healthcare (HIBC)', 'A123BJC5D6E71', { opts: ['aztecEcc', 'aztecSize'] }),

  // ---- Postal ----
  S(40, 'USPS POSTNET', 'Postal', '12345678901'),
  S(82, 'USPS PLANET', 'Postal', '1234567890123'),
  S(85, 'USPS Intelligent Mail', 'Postal', '01234567094987654321-01234'),
  S(70, 'Royal Mail 4-State (RM4SCC)', 'Postal', 'ZINT1A'),
  S(121, 'Royal Mail 4-State Mailmark', 'Postal', '21B2254800659JW5O9QA6Y'),
  S(63, 'Australia Post Standard', 'Postal', '12345678'),
  S(66, 'Australia Post Reply Paid', 'Postal', '12345678'),
  S(67, 'Australia Post Routing', 'Postal', '12345678'),
  S(68, 'Australia Post Redirection', 'Postal', '12345678'),
  S(76, 'Japanese Postal Code', 'Postal', '15400233-16-4-205'),
  S(77, 'Korea Post', 'Postal', '123456'),
  S(90, 'Dutch Post KIX', 'Postal', '2500GG30250'),
  S(93, 'DAFT Code', 'Postal', 'DAFTFADTDAFTFATDADFT'),
  S(54, 'Brazilian CEPNet', 'Postal', '12345678'),
];

// Sensible starting points shown in the "Popular" group
export const POPULAR_IDS = [58, 20, 15, 71, 55, 92, 8, 34, 16, 3];

export const BY_ID = new Map(SYMBOLOGIES.map((s) => [s.id, s]));

const sel = (label, slot, choices, hint) => ({ type: 'select', label, slot, choices, hint });
const num = (label, slot, min, max, hint) => ({ type: 'number', label, slot, min, max, hint });

// Symbology-specific controls. `slot` is option_1 / option_2 / option_3 in Zint.
export const OPTION_DEFS = {
  qrEcc: sel('Error correction', 'option_1', [[0, 'Auto (L)'], [1, 'L (~7%)'], [2, 'M (~15%)'], [3, 'Q (~25%)'], [4, 'H (~30%)']]),
  qrVersion: num('Version (0 = auto)', 'option_2', 0, 40, '1 to 40'),
  mqrEcc: sel('Error correction', 'option_1', [[0, 'Auto'], [1, 'L'], [2, 'M'], [3, 'Q']]),
  mqrVersion: sel('Version', 'option_2', [[0, 'Auto'], [1, 'M1'], [2, 'M2'], [3, 'M3'], [4, 'M4']]),
  rmqrEcc: sel('Error correction', 'option_1', [[0, 'Auto (M)'], [2, 'M (~15%)'], [4, 'H (~30%)']]),
  rmqrVersion: num('Version (0 = auto)', 'option_2', 0, 32, '1 to 32'),
  dmSize: num('Size (0 = auto)', 'option_2', 0, 48, '1 to 48'),
  dmShape: sel('Shape', 'option_3', [[0, 'Automatic'], [0x64, 'Square only'], [0x65, 'Include rectangular (DMRE)']]),
  aztecEcc: sel('Error correction', 'option_1', [[0, 'Auto (23%)'], [1, '10%'], [2, '23%'], [3, '36%'], [4, '50%']]),
  aztecSize: num('Size (0 = auto)', 'option_2', 0, 36, '1 to 36'),
  pdfEcc: sel('Security level', 'option_1', [[-1, 'Auto'], [0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6'], [7, '7'], [8, '8']]),
  pdfCols: num('Columns (0 = auto)', 'option_2', 0, 30, '1 to 30'),
  mpdfCols: sel('Columns', 'option_2', [[0, 'Auto'], [1, '1'], [2, '2'], [3, '3'], [4, '4']]),
  maxiMode: sel('Mode', 'option_1', [[0, 'Auto (4, or 2/3 with primary message)'], [2, '2 (structured, numeric postcode)'], [3, '3 (structured, alphanumeric postcode)'], [4, '4 (standard)'], [5, '5 (full ECC)'], [6, '6 (reader programming)']]),
  dotcodeCols: num('Columns (0 = auto)', 'option_2', 0, 200, 'Up to 200'),
  hxEcc: sel('Error correction', 'option_1', [[0, 'Auto (L2)'], [1, 'L1 (~8%)'], [2, 'L2 (~15%)'], [3, 'L3 (~23%)'], [4, 'L4 (~30%)']]),
  hxVersion: num('Version (0 = auto)', 'option_2', 0, 84, '1 to 84'),
  gmEcc: sel('Error correction', 'option_1', [[0, 'Auto (L3)'], [1, 'L1 (~10%)'], [2, 'L2 (~20%)'], [3, 'L3 (~30%)'], [4, 'L4 (~40%)'], [5, 'L5 (~50%)']]),
  gmVersion: num('Version (0 = auto)', 'option_2', 0, 13, '1 to 13'),
  c1Version: sel('Version', 'option_2', [[0, 'Auto'], [1, 'A'], [2, 'B'], [3, 'C'], [4, 'D'], [5, 'E'], [6, 'F'], [7, 'G'], [8, 'H'], [9, 'S (structured)'], [10, 'T']]),
  ultraEcc: sel('Error correction', 'option_2', [[0, 'Auto (EC2)'], [1, 'EC0 (0%)'], [2, 'EC1 (~5%)'], [3, 'EC2 (~9%)'], [4, 'EC3 (~17%)'], [5, 'EC4 (~25%)'], [6, 'EC5 (~33%)']]),
  cbfRows: num('Rows (0 = auto)', 'option_1', 0, 44, '2 to 44'),
  cbfCols: num('Columns (0 = auto)', 'option_2', 0, 67, '9 to 67'),
  ccType: sel('Composite component', 'option_1', [[0, 'Auto'], [1, 'CC-A'], [2, 'CC-B'], [3, 'CC-C']]),
  dbarCols: sel('Segments per row', 'option_2', [[0, 'Auto'], [2, '2'], [4, '4'], [6, '6'], [8, '8'], [10, '10'], [12, '12'], [14, '14'], [16, '16'], [18, '18'], [20, '20']]),
  checkDigit: sel('Check digit', 'option_2', [[0, 'None'], [1, 'Add check digit'], [2, 'Add check digit (hidden in text)']]),
  code11Check: sel('Check digits', 'option_2', [[0, 'Two (default)'], [1, 'One'], [2, 'None']]),
  msiCheck: sel('Check digit', 'option_2', [[0, 'None'], [1, 'Mod 10'], [2, 'Mod 10 + Mod 10'], [3, 'Mod 11'], [4, 'Mod 11 + Mod 10']]),
  fullMultibyte: { type: 'check', label: 'Compress Kanji/Hanzi (full multibyte)', slot: 'option_3', on: 200 },
};

export const ECI_CHOICES = [
  [0, 'None (default)'],
  [26, 'UTF-8'],
  [3, 'ISO-8859-1 (Latin-1)'],
  [4, 'ISO-8859-2'],
  [9, 'ISO-8859-7 (Greek)'],
  [11, 'ISO-8859-9 (Turkish)'],
  [13, 'ISO-8859-11 (Thai)'],
  [17, 'ISO-8859-15 (Latin-9)'],
  [20, 'Shift JIS'],
  [21, 'Windows-1250'],
  [22, 'Windows-1251 (Cyrillic)'],
  [23, 'Windows-1252'],
  [24, 'Windows-1256 (Arabic)'],
  [25, 'UTF-16BE'],
  [27, 'ASCII'],
  [28, 'Big5'],
  [29, 'GB 2312'],
  [30, 'EUC-KR'],
  [31, 'GBK'],
  [32, 'GB 18030'],
];

// Output formats supported by Zint
export const FORMATS = [
  { ext: 'svg', label: 'SVG', mime: 'image/svg+xml', note: 'Vector, scales to any size' },
  { ext: 'png', label: 'PNG', mime: 'image/png', note: 'Raster, best for screens and documents' },
  { ext: 'eps', label: 'EPS', mime: 'application/postscript', note: 'Vector, for print workflows' },
  { ext: 'emf', label: 'EMF', mime: 'image/emf', note: 'Vector, for Microsoft Office' },
  { ext: 'gif', label: 'GIF', mime: 'image/gif', note: 'Raster' },
  { ext: 'bmp', label: 'BMP', mime: 'image/bmp', note: 'Raster, uncompressed' },
  { ext: 'tif', label: 'TIFF', mime: 'image/tiff', note: 'Raster, for print' },
  { ext: 'pcx', label: 'PCX', mime: 'image/x-pcx', note: 'Raster, legacy' },
  { ext: 'txt', label: 'TXT', mime: 'text/plain', note: 'Text/hex dump of the modules' },
];
