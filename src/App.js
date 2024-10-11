import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Container } from "@mui/material";
import {
  getTitlesByLanguage,
  getLanguageSpecificColumns,
} from "./utils/TranslationUtil";
import CoupletDialog from "./components/CoupletDialog";
import dbManagerInstance from "./utils/DbManager";
import TitleList from "./components/TitleList";
import SearchView from "./components/SearchView";
import { defaultSearchOptions } from "./utils/PresetSearch";
import { getHeadingTranslation } from "./utils/TranslationUtil";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headings, setHeadings] = useState({});
  const [chapters, setChapters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTitle, setExpandedTitle] = useState(false);
  const [expandedHeadings, setExpandedHeadings] = useState({});
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const languages = [
    { code: "Tamil", name: "தமிழ்" },
    { code: "English", name: "English" },
    { code: "telugu", name: "ెలుగు" },
    { code: "hindi", name: "हिन्दी" },
    { code: "kannad", name: "ಕನ್ನಡ" },
    { code: "french", name: "Français" },
    { code: "arabic", name: "العربية" },
    { code: "chinese", name: "中文" },
    { code: "german", name: "Deutsch" },
    { code: "korean", name: "한국어" },
    { code: "malay", name: "Bahasa Melayu" },
    { code: "malayalam", name: "മലയാളം" },
    { code: "polish", name: "Polski" },
    { code: "russian", name: "Русский" },
    { code: "sinhala", name: "සිංහල" },
    { code: "swedish", name: "Svenska" },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState("Tamil");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCouplet, setSelectedCouplet] = useState(null);
  const [relatedCouplets, setRelatedCouplets] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  const titles = useMemo(
    () => getTitlesByLanguage(selectedLanguage),
    [selectedLanguage]
  );

  useEffect(() => {
    const initDB = async () => {
      try {
        await dbManagerInstance.initDB();
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error initializing DuckDB or loading vallu.db:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    initDB();
  }, [retryCount]);

  useEffect(() => {
    async function fetchHeadings() {
      try {
        const allHeadings = await dbManagerInstance.fetchHeadings(
          selectedLanguage
        );
        setHeadings(allHeadings);
      } catch (error) {
        console.error("Error fetching headings:", error);
        setError("Failed to fetch headings");
      }
    }
    if (!loading) {
      fetchHeadings();
    }
  }, [loading, titles, selectedLanguage]);

  const fetchChapters = async (title, heading) => {
    try {
      const chaptersArray = await dbManagerInstance.fetchChapters(
        title,
        heading,
        selectedLanguage
      );
      setChapters((prev) => ({
        ...prev,
        [title]: {
          ...prev[title],
          [heading]: chaptersArray,
        },
      }));
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError("Failed to fetch chapters");
    }
  };

  const fetchCouplets = async (title, heading, chapter) => {
    try {
      return await dbManagerInstance.fetchCouplets(chapter, selectedLanguage);
    } catch (error) {
      console.error("Error fetching couplets:", error);
      setError("Failed to fetch couplets");
      return [];
    }
  };

  const fetchRelatedIDs = async (related_rows) => {
    const relatedKnos = related_rows
      .split(",")
      .map((num) => num.trim())
      .join(",")
      .replace(/]/g, "")
      .replace(/\[/g, "");
    try {
      const relatedCouplets = await dbManagerInstance.fetchRelatedCouplets(
        relatedKnos,
        selectedLanguage
      );
      setRelatedCouplets(relatedCouplets);
    } catch (error) {
      console.error("Error fetching related couplets:", error);
      setError("Failed to fetch related couplets");
    }
  };

  const fetchExplanation = async (kno) => {
    try {
      const explanation = await dbManagerInstance.fetchExplanation(
        kno,
        selectedLanguage
      );
      fetchRelatedIDs(explanation.relatedRows);
      return explanation;
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setError("Failed to fetch explanation");
      return { explanation: "", relatedRows: "" };
    }
  };

  const handleChapterClick = async (title, heading, chapter) => {
    const chapterKey = `${title}-${heading}-${chapter}`;
    if (expandedChapter === chapterKey) {
      setExpandedChapter(null);
    } else {
      const couplets = await fetchCouplets(title, heading, chapter);
      setExpandedChapter(chapterKey);
      setExpandedChapters({ [chapterKey]: couplets });
    }
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleTitleChange = (title) => (event, isExpanded) => {
    setExpandedTitle(isExpanded ? title : false);
    if (!isExpanded) {
      setExpandedHeadings({});
    }
  };

  const handleHeadingChange = (title, heading) => (event, isExpanded) => {
    setExpandedHeadings((prev) => ({
      ...prev,
      [title]: isExpanded ? heading : false,
    }));
    if (isExpanded) {
      fetchChapters(title, heading);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async () => {
    if (!isNaN(searchTerm) && searchTerm.trim() !== "") {
      const explanation = await fetchExplanation(searchTerm, selectedLanguage);
      setDialogOpen(true);
      let couplet = { kno: searchTerm, explanation: explanation };
      setSelectedCouplet(couplet);
    } else if (searchTerm.trim() !== "") {
      let relatedIds = await dbManagerInstance.searchSentences(
        searchTerm,
        selectedLanguage,
        5
      );
      openAIResponse(relatedIds, selectedLanguage);
    }
  };

  const openAIResponse = async (relatedIds, selectedLanguage) => {
    console.log(relatedIds);
    const explanation = await fetchExplanation(relatedIds[0], selectedLanguage);
    setDialogOpen(true);
    let couplet = {
      kno: relatedIds[0],
      explanation: explanation,
      relatedIds: relatedIds,
    };
    setSelectedCouplet(couplet);
  };

  const handlePredefinedSearch = (question, selectedLanguage) => {
    setSearchTerm(getHeadingTranslation(question, selectedLanguage));
    const category = Object.keys(defaultSearchOptions).find((cat) =>
      Object.keys(defaultSearchOptions[cat]).includes(question)
    );

    if (category) {
      let relatedIDList = defaultSearchOptions[category][question];
      openAIResponse(relatedIDList, selectedLanguage);
    } else {
      console.error("Question not found in defaultSearchOptions");
    }
  };

  if (loading) {
    return <p>Loading Vallluvan...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Clear your browser cache and reload the page</p>
        <button onClick={() => setRetryCount((prev) => prev + 1)}>
          Retry Loading Database
        </button>
      </div>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Valluvan
        </Typography>
        <SearchView
          searchTerm={searchTerm}
          selectedLanguage={selectedLanguage}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
          handlePredefinedSearch={handlePredefinedSearch}
          languages={languages}
          handleLanguageChange={handleLanguageChange}
        />

        <TitleList
          titles={titles}
          headings={headings}
          chapters={chapters}
          selectedLanguage={selectedLanguage}
          expandedTitle={expandedTitle}
          expandedHeadings={expandedHeadings}
          expandedChapter={expandedChapter}
          expandedChapters={expandedChapters}
          handleTitleChange={handleTitleChange}
          handleHeadingChange={handleHeadingChange}
          handleChapterClick={handleChapterClick}
          fetchExplanation={fetchExplanation}
          setSelectedCouplet={setSelectedCouplet}
          setDialogOpen={setDialogOpen}
          searchTerm={searchTerm}
        />

        <CoupletDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          selectedCouplet={selectedCouplet}
          selectedLanguage={selectedLanguage}
          relatedCouplets={relatedCouplets}
          getLanguageSpecificColumns={getLanguageSpecificColumns}
        />
      </Box>
    </Container>
  );
}

export default App;
