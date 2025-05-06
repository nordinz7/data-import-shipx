# bun-xlsx-to-csv

## Overview
This project provides a simple utility to read an XLSX file and convert each sheet into separate CSV files. It leverages the `xlsx` library for reading Excel files and the built-in `fs` module for file system operations.

## Prerequisites
- Ensure you have [Bun](https://bun.sh/) installed on your machine.
- Node.js is also required for the `xlsx` library.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd bun-xlsx-to-csv
   ```

2. Install the dependencies:
   ```
   bun install
   ```

## Usage
To convert an XLSX file to CSV files, run the following command in your terminal:

```
bun src/index.ts <path-to-your-xlsx-file>
```

Replace `<path-to-your-xlsx-file>` with the actual path to the XLSX file you want to convert.

## Output
Each sheet in the XLSX file will be saved as a separate CSV file in the same directory as the input file, named according to the sheet name.

## Contributing
Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License
This project is licensed under the MIT License.