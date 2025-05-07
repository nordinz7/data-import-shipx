# Data Import to ShipX Format

## Overview

Convert HMS XLSX data into ShipX-compatible CSV files for master data import.

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

## Installation

1. Clone the repository:

   ```sh
   git clone git@github.com:nordinz7/data-import-shipx.git
   cd data-import-shipx
   ```

2. Install dependencies:
   ```sh
   bun install
   ```
3. put `xlsx` file to be converted in the `input` folder
4. run
   ```sh
   bun run start
   ```
5. output will be in the `output` folder
6. check the output folder for the converted CSV files.
