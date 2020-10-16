import LOGGER from "./logger";
import CSV from "csv-parser";
import fs from "fs";
const ObjectsToCsv = require("objects-to-csv");

const log = new LOGGER();

class DB {
  data: any[] = [];

  constructor() {
    const results: any = [];

    fs.createReadStream("data.txt")
      .pipe(
        CSV({
          headers: [
            "id",
            "name",
            "surname",
            "address",
            "phone",
            "email",
            "date",
          ],
          separator: ",",
          mapValues: ({ header, index, value }) => {
            if (header === "id") return parseInt(value, 10); // help csv-parser convert id to number, useful for DB sorting
            return value;
          },
        })
      )
      .on("data", (data: any) => results.push(data))
      .on("end", () => {
        this.data = results;
      });
    log.write("constructor executed");
  }

  read(options: any) {
    // read DB
    // tslint:disable-next-line: no-shadowed-variable
    let response = this.data;
    let next = false;
    let prev = false;

    // filter
    if (options.filter && options.filter.key && options.filter.value) {
      response = response.filter((row) => {
        return row[options.filter.key] === options.filter.value;
      });
    }

    // sort
    if (options.sort && options.sort.key && options.sort.order) {
      response = response.sort((rowA: any, rowB: any) => {
        if (rowA[options.sort.key] > rowB[options.sort.key]) {
          return options.sort.order === "asc" ? 1 : -1;
        }
        if (rowA[options.sort.key] < rowB[options.sort.key]) {
          return options.sort.order === "asc" ? -1 : 1;
        }
        return 0;
      });
    }

    // page
    const numberOfResults: number = 10;
    const responseStart: number = options.page * numberOfResults;
    const responseEnd: number =
      options.page * numberOfResults + numberOfResults;

    if (responseEnd < response.length - 1) next = true;
    if (responseStart > 0) prev = true;

    response = response.slice(responseStart, responseEnd);

    // @next : boolean, there are more results in next pages
    // @prev : boolean, there are more results in prev pages
    return {
      results: response,
      next,
      prev,
    };
  }

  write(row: any) {
    // get Id
    const idsArray = this.data.map((row) => row.id);

    log.write(idsArray);

    const id: number = Math.max(...idsArray);
    log.write(id);

    // Add to memory
    row.id = id;
    this.data.push(row);

    // If you use "await", code must be inside an asynchronous function:
    (async () => {
      const csv = new ObjectsToCsv(new Array(row));

      // Save to file:
      await csv.toDisk("./data.txt", { append: true });

      // Return the CSV file as string:
      log.write(await csv.toString());
    })();

    return {
      result: row,
    };
  }
}

export default DB;
