import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClearIcon from "@mui/icons-material/Clear";
import { defaultSearchOptions } from "../utils/PresetSearch";
import { getHeadingTranslation } from "../utils/TranslationUtil";

function SearchView({
  searchTerm,
  selectedLanguage,
  handleSearchChange,
  handleSearchSubmit,
  handlePredefinedSearch,
  languages,
  handleLanguageChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  const handleClearSearch = () => {
    handleSearchChange({ target: { value: "" } });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mr: 1, flexGrow: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={handleSearchSubmit}>
          AI Search
        </Button>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={selectedLanguage}
          label="Language"
          onChange={handleLanguageChange}
          sx={{ ml: 2, minWidth: 120 }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Accordion expanded={expanded} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="ai-suggestions-content"
          id="ai-suggestions-header"
        >
          <Typography variant="h6">AI Suggestions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(defaultSearchOptions).map(([category, questions]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {getHeadingTranslation(category, selectedLanguage)}
              </Typography>
              {Object.keys(questions).map((question) => (
                <Button
                  key={question}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() =>
                    handlePredefinedSearch(question, selectedLanguage)
                  }
                >
                  {getHeadingTranslation(question, selectedLanguage)}
                </Button>
              ))}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default SearchView;
