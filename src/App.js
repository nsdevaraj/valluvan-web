import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import {
  Box,
  Container,
  IconButton,
  CssBaseline,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
import logo from "./logo.svg";
import black from "./black.svg";
import {
  Brightness4,
  Brightness7,
  TextIncrease,
  TextDecrease,
  Twitter,
  GitHub,
} from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SQLBrowser from "./components/SQLBrowser";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const NetworkGraph = lazy(() => import("./components/NetworkGraph"));

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
  const [selectedLanguage, setSelectedLanguage] = useState("Tamil");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCouplet, setSelectedCouplet] = useState(null);
  const [relatedCouplets, setRelatedCouplets] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [largeFont, setLargeFont] = useState(false);

  const languages = [
    { code: "Tamil", name: "தமிழ்" },
    { code: "English", name: "English" },
    { code: "telugu", name: "తెలుగు" },
    { code: "hindi", name: "हिन्दी" },
    { code: "kannad", name: "ಕನ್ನಡ" },
    { code: "french", name: "Français" },
    { code: "arabic", name: "اعربية" },
    { code: "chinese", name: "中文" },
    { code: "german", name: "Deutsch" },
    { code: "korean", name: "한국어" },
    { code: "malay", name: "Bahasa Melayu" },
    { code: "malayalam", name: "മലയാളം" },
    { code: "polish", name: "Polski" },
    { code: "russian", name: "Русский" },
    { code: "singalam", name: "සිංහල" },
    { code: "swedish", name: "Svenska" },
  ];

  const titles = useMemo(
    () => getTitlesByLanguage(selectedLanguage),
    [selectedLanguage]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
        typography: {
          fontSize: largeFont ? 18 : 14,
        },
      }),
    [darkMode, largeFont]
  );

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const toggleFontSize = () => {
    setLargeFont((prevSize) => !prevSize);
  };

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
      const adhigaramKnos = chaptersArray.map((chapter) => chapter.kno);
      const adhigaramChapters = chaptersArray.map((chapter) => chapter.chapter);
      setChapters((prev) => ({
        ...prev,
        [title]: {
          ...prev[title],
          [heading]: adhigaramChapters,
          [heading + "Knos"]: adhigaramKnos,
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
      const coupletArray = await dbManagerInstance.fetchCouplet(
        searchTerm,
        selectedLanguage
      );
      let couplet = {
        kno: String(searchTerm), // Ensure kno is a string
        couplet: coupletArray[0],
        explanation: explanation,
      };
      setSelectedCouplet(couplet);
    } else if (searchTerm.trim() !== "") {
      var relatedIds = [1006, 916, 626, 135, 554];
      if (dbManagerInstance.singletonDb.length > 0) {
        relatedIds = await dbManagerInstance.retrieveRelatedDocuments(
          searchTerm,
          5
        );
      }
      openAIResponse(relatedIds, selectedLanguage);
    }
  };

  const handleFavoriteClick = () => {
    let explanation = fetchRelatedIDs(localStorage.getItem("favorites"));
    setDialogOpen(true);
    let couplet = {
      kno: "",
      explanation: explanation,
    };
    setSelectedCouplet(couplet);
  };

  const openAIResponse = async (relatedIds, selectedLanguage) => {
    console.log(relatedIds);
    const explanation = await fetchExplanation(relatedIds[1], selectedLanguage);
    setDialogOpen(true);

    const coupletArray = await dbManagerInstance.fetchCouplet(
      relatedIds[1],
      selectedLanguage
    );
    let couplet = {
      kno: String(relatedIds[1]),
      couplet: coupletArray[0],
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
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <img
          src={logo}
          alt="Valluvan"
          style={{ width: "25px", height: "auto" }}
        />
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading Vallluvan...
        </Typography>
      </Box>
    );
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <img
              src={darkMode ? black : logo}
              alt="Valluvan"
              style={{ width: "25px", height: "auto" }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <IconButton>
                <a
                  href="https://x.com/nsdevaraj"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter alt="Author's Twitter" />
                </a>
              </IconButton>
              <IconButton>
                <a
                  href="https://github.com/nsdevaraj/Valluvan-web"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHub alt="Source Code" />
                </a>
              </IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />{" "}
              <IconButton onClick={toggleFontSize}>
                {largeFont ? <TextDecrease /> : <TextIncrease />}
              </IconButton>
              <IconButton
                onClick={handleFavoriteClick}
                style={{ marginLeft: "10px" }}
              >
                <FavoriteIcon color="error" />
              </IconButton>
              <IconButton onClick={toggleTheme}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Box>
          <SearchView
            sx={{ mx: 1, my: 1 }}
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
          <br />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Kural Browser</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SQLBrowser />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Kural Graph</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Suspense fallback={<div>Loading Network Graph...</div>}>
                <NetworkGraph
                  setSearchTerm={setSearchTerm}
                  onSearchSubmit={handleSearchSubmit}
                />
              </Suspense>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
