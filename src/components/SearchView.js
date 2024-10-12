import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  InputLabel,
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
import SearchIcon from "@mui/icons-material/Search";
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
          label="OpenAI Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mr: 1, flexGrow: 1 }}
          onKeyPress={handleSearchSubmit}
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
        <IconButton onClick={handleSearchSubmit} color="primary">
          <SearchIcon />
        </IconButton>

        <FormControl sx={{ ml: 2, minWidth: 100 }}>
          <InputLabel id="language-select-label" sx={{ ml: 2 }}>
            Lang
          </InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            variant="outlined"
            value={selectedLanguage}
            label="Lang"
            onChange={handleLanguageChange}
            sx={{ ml: 2, flexGrow: 1, minWidth: 90 }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Accordion expanded={expanded} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="ai-suggestions-content"
          id="ai-suggestions-header"
        >
          <Typography variant="h6">Ask AI</Typography>
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

SearchView.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired,
  handlePredefinedSearch: PropTypes.func.isRequired,
  languages: PropTypes.array.isRequired,
  handleLanguageChange: PropTypes.func.isRequired,
};

export default SearchView;
