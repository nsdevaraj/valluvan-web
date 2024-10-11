import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWorkerUrl from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";
import {
  getLanguageSpecificColumns,
  getTitlesByLanguage,
} from "./TranslationUtil";

class DbManager {
  constructor() {
    if (DbManager.instance) {
      return DbManager.instance;
    }
    DbManager.instance = this;

    this.db = null;
    this.isAttached = false;
    this.initPromise = null;

    // Update to use the Netlify environment variable
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

    this.singletonDb = [];
    setTimeout(() => this.loadSingletonDb(), 2000);
    this.initializationStatus = "not started";
  }

  promptForApiKey() {
    this.apiKey = prompt(
      "Please enter your OpenAI API key or try again later with the key:"
    );
    if (this.apiKey) {
      console.log("API key set successfully");
    } else {
      console.error("API key is required for certain functionalities");
    }
  }

  async generateEmbedding(query) {
    const model = "text-embedding-ada-002";
    const url = "https://api.openai.com/v1/embeddings";
    if (this.apiKey === "") {
      console.warn("OPENAI_API_KEY is not set");
      this.promptForApiKey();
    }
    const body = {
      model: model,
      input: query,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (json.data && json.data[0] && json.data[0].embedding) {
        return json.data[0].embedding.map(Number);
      } else {
        console.log("Failed to parse embedding from JSON response", json);
        return null;
      }
    } catch (error) {
      console.error("Error generating embedding:", error);
      return null;
    }
  }

  async retrieveRelatedDocuments(query, topN) {
    const ids = this.singletonDb.map((item) => item.id);
    const embeddings = this.singletonDb.map((item) => item.values);

    const queryEmbedding = await this.generateEmbedding(query);
    if (!queryEmbedding) {
      return [];
    }

    const similarities = embeddings.map((embedding) =>
      this.cosineSimilarity(queryEmbedding, embedding)
    );
    const relatedIndices = similarities
      .map((similarity, index) => ({ similarity, index }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map((item) => item.index);

    return relatedIndices.map((index) => ids[index]);
  }

  cosineSimilarity(v1, v2) {
    const dotProduct = v1.reduce((sum, v1i, i) => sum + v1i * v2[i], 0);
    const magnitude1 = Math.sqrt(v1.reduce((sum, v1i) => sum + v1i * v1i, 0));
    const magnitude2 = Math.sqrt(v2.reduce((sum, v2i) => sum + v2i * v2i, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  async searchSentences(query, language, topN) {
    return await this.retrieveRelatedDocuments(query, topN);
  }

  async loadSingletonDb() {
    try {
      await this.fetchAndStoreSingletonDb();
    } catch (error) {
      console.error("Error parsing saved singletonDb:", error);
    }
  }

  async fetchAndStoreSingletonDb() {
    try {
      const embeddings = await this.singletonKurals();

      const serializableEmbeddings = embeddings.map((item) => ({
        id: parseInt(item.id),
        values: item.values.map(Number),
      }));
      this.singletonDb = serializableEmbeddings;
    } catch (error) {
      console.error("Error fetching and storing singletonDb:", error);
    }
  }

  processEmbeddingBinding(embeddingBinding) {
    // Convert the binding to a string representation
    let hexString = String(embeddingBinding)
      .replace(/Optional\(x'/, "")
      .replace(/'?\)/, "")
      .replace(/\s/g, ""); // Remove any spaces if present

    // Check if the hex string is valid
    if (hexString.length === 0) {
      console.log("Hex string is empty after cleaning");
      return null;
    }

    // Ensure the hex string does not start with 'x'
    let cleanedHexString = hexString.replace(/^x/, "");

    // Convert hex string to float array
    const floatArray = this.hexStringToFloatArray(cleanedHexString);
    if (floatArray === null) {
      console.log(`Failed to process embedding: ${embeddingBinding}`);
      return null;
    }
    return floatArray;
  }

  hexStringToFloatArray(hexString) {
    try {
      // Ensure the hex string has an even number of characters
      if (hexString.length % 2 !== 0) {
        // console.warn(`Odd-length hex string: ${hexString}`);
        hexString = "0" + hexString; // Prepend a '0' to make it even
      }

      let byteArray = new Uint8Array(
        hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );

      // Ensure the byte length is a multiple of 4
      if (byteArray.length % 4 !== 0) {
        // console.warn(
        //   `Byte length (${byteArray.length}) is not a multiple of 4. Padding...`
        // );
        const paddedLength = Math.ceil(byteArray.length / 4) * 4;
        const paddedArray = new Uint8Array(paddedLength);
        paddedArray.set(byteArray);
        byteArray = paddedArray;
      }

      const floatArray = new Float32Array(byteArray.buffer);
      return Array.from(floatArray);
    } catch (error) {
      console.error("Error in hexStringToFloatArray:", error);
      console.error("Problematic hex string:", hexString);
      return null;
    }
  }

  async singletonKurals() {
    if (!this.db) {
      console.error("Database not initialized");
      return [];
    }

    try {
      const conn = await this.db.connect();
      const query =
        "SELECT kno, embeddings FROM vallu.tirukkural WHERE embeddings IS NOT NULL";
      const result = await conn.query(query);
      const rows = result.toArray();

      const allEmbeddings = rows
        .map((row) => {
          const id = row.kno;
          const embeddingString = row.embeddings;
          if (embeddingString) {
            const floatArray = this.processEmbeddingBinding(embeddingString);
            return floatArray ? { id, values: floatArray } : null;
          } else {
            console.log(`Failed to process embedding for kno ${id}`);
            return null;
          }
        })
        .filter((embedding) => embedding !== null);

      await conn.close();
      return allEmbeddings;
    } catch (error) {
      console.error("Error fetching related kurals:", error);
      return [];
    }
  }

  async initDB() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        if (this.db && this.isAttached) {
          console.log("Database already initialized and attached");
          return this.db;
        }

        if (!this.db) {
          const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
          const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

          const worker = new Worker(duckdbWorkerUrl);
          const logger = new duckdb.ConsoleLogger();
          this.db = new duckdb.AsyncDuckDB(logger, worker);
          await this.db.instantiate(bundle.mainModule);

          const response = await fetch("/vallu.db");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();

          await this.db.registerFileBuffer(
            "vallu.db",
            new Uint8Array(arrayBuffer)
          );
        }

        const conn = await this.db.connect();

        try {
          await conn.query("ATTACH 'vallu.db' AS vallu");

          const result = await conn.query(
            "SELECT * FROM vallu.tirukkural LIMIT 1"
          );
          console.log(
            "Successfully queried tirukkural table:",
            result.toArray()
          );

          this.isAttached = true;
        } catch (error) {
          console.error("Error attaching or querying database:", error);
          throw error;
        } finally {
          await conn.close();
        }

        console.log("Database initialized successfully");
        return this.db;
      } catch (error) {
        console.error("Error initializing DuckDB or loading db:", error);
        throw new Error(
          `Failed to initialize database or load db: ${error.message}`
        );
      }
    })();

    return this.initPromise;
  }

  async ensureDbInitialized() {
    if (!this.db || !this.isAttached) {
      console.log("Database not initialized. Initializing now...");
      await this.initDB();
    }
  }

  async fetchHeadings(selectedLanguage) {
    await this.ensureDbInitialized();

    try {
      const conn = await this.db.connect();
      const allHeadings = {};
      const { headingColumn } = getLanguageSpecificColumns(selectedLanguage);
      for (const title of getTitlesByLanguage("Tamil")) {
        const result = await conn.query(`
          SELECT ${headingColumn}
          FROM vallu.tirukkural
          WHERE pal = '${title}'
          GROUP BY ${headingColumn}
          ORDER BY MIN(kno)
        `);
        const headingsArray = result.toArray().map((row) => row[headingColumn]);
        allHeadings[title] = headingsArray;
      }
      await conn.close();
      return allHeadings;
    } catch (error) {
      console.error("Error fetching headings:", error);
      throw new Error("Failed to fetch headings");
    }
  }

  async fetchChapters(title, heading, selectedLanguage) {
    await this.ensureDbInitialized();
    try {
      const conn = await this.db.connect();
      const { headingColumn, chapterColumn } =
        getLanguageSpecificColumns(selectedLanguage);
      const result = await conn.query(`
        SELECT ${chapterColumn}, MAX(kno) as kno
        FROM vallu.tirukkural
        WHERE pal = '${title}' AND ${headingColumn} = '${heading}'
        GROUP BY ${chapterColumn}
        ORDER BY MIN(kno)
      `);

      const chaptersArray = result.toArray().map((row) => ({
        chapter: row[chapterColumn],
        kno: row.kno,
      }));
      await conn.close();
      return chaptersArray;
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw new Error("Failed to fetch chapters");
    }
  }

  async fetchCouplets(chapter, selectedLanguage) {
    await this.ensureDbInitialized();
    try {
      const conn = await this.db.connect();
      const { chapterColumn, firstLineColumn, secondLineColumn } =
        getLanguageSpecificColumns(selectedLanguage);

      let selectPart = `kno, ${firstLineColumn}`;
      if (secondLineColumn) {
        selectPart += `, ${secondLineColumn}`;
      }

      const result = await conn.query(`
        SELECT ${selectPart}
        FROM vallu.tirukkural
        WHERE ${chapterColumn} = '${chapter.replace(/'/g, "''")}'
        ORDER BY kno
      `);
      const coupletsArray = result.toArray();
      await conn.close();
      return coupletsArray;
    } catch (error) {
      console.error("Error fetching couplets:", error);
      throw new Error("Failed to fetch couplets");
    }
  }

  async fetchRelatedCouplets(relatedKnos, selectedLanguage) {
    await this.ensureDbInitialized();
    if (this.db && relatedKnos) {
      try {
        const conn = await this.db.connect();
        const { firstLineColumn, secondLineColumn, explanation } =
          getLanguageSpecificColumns(selectedLanguage);

        let selectPart = `kno, ${firstLineColumn}`;
        if (secondLineColumn) {
          selectPart += `, ${secondLineColumn}`;
        }
        selectPart += `, ${explanation}`;

        const result = await conn.query(`
          SELECT ${selectPart}
          FROM vallu.tirukkural
          WHERE kno IN (${relatedKnos})
          ORDER BY kno
        `);
        await conn.close();
        return result.toArray();
      } catch (error) {
        console.error("Error fetching related couplets:", error);
        throw new Error("Failed to fetch related couplets");
      }
    }
    return [];
  }

  async fetchCouplet(Kno, selectedLanguage) {
    await this.ensureDbInitialized();
    if (this.db) {
      try {
        const conn = await this.db.connect();
        const { firstLineColumn, secondLineColumn, explanation } =
          getLanguageSpecificColumns(selectedLanguage);

        let selectPart = `kno, ${firstLineColumn}`;
        if (secondLineColumn) {
          selectPart += `, ${secondLineColumn}`;
        }
        selectPart += `, ${explanation}`;

        const result = await conn.query(`
          SELECT ${selectPart}
          FROM vallu.tirukkural
          WHERE kno = ${Kno}
        `);
        await conn.close();
        return result.toArray();
      } catch (error) {
        console.error("Error fetching related couplets:", error);
        throw new Error("Failed to fetch related couplets");
      }
    }
    return [];
  }

  async fetchExplanation(kno, language) {
    await this.ensureDbInitialized();
    try {
      const conn = await this.db.connect();
      let query, result;

      if (language === "Tamil") {
        const explanationsArray =
          getLanguageSpecificColumns("Tamil").explanationColumns;
        query = `
          SELECT ${explanationsArray.join(", ")}, related_rows
          FROM vallu.tirukkural
          WHERE kno = ${kno}
        `;
        result = await conn.query(query);
        await conn.close();
        return {
          ...result.toArray()[0],
          relatedRows: result.toArray()[0].related_rows,
        };
      } else {
        query = `
          SELECT explanation, related_rows
          FROM vallu.tirukkural
          WHERE kno = ${kno}
        `;
        result = await conn.query(query);
        await conn.close();
        const { explanation, related_rows } = result.toArray()[0];
        return {
          explanation,
          relatedRows: related_rows,
        };
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      throw new Error("Failed to fetch explanation");
    }
  }
}

const dbManagerInstance = new DbManager();

export default dbManagerInstance;
