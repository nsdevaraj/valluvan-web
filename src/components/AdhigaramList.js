import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getAdhigaramTranslation,
  getLanguageSpecificColumns,
} from "../utils/TranslationUtil";

function AdhigaramList({
  chapters,
  title,
  heading,
  selectedLanguage,
  expandedChapter,
  expandedChapters,
  handleChapterClick,
  fetchExplanation,
  setSelectedCouplet,
  setDialogOpen,
}) {
  return (
    <List>
      {chapters[title][heading].map((chapter, chapterIndex) => {
        const chapterKey = `${title}-${heading}-${chapter}`;
        return (
          <Accordion
            key={chapterIndex}
            expanded={expandedChapter === chapterKey}
            onChange={() => handleChapterClick(title, heading, chapter)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {getAdhigaramTranslation(chapter, selectedLanguage)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {expandedChapter === chapterKey &&
              expandedChapters[chapterKey] ? (
                expandedChapters[chapterKey].map((couplet) => {
                  const { firstLineColumn, secondLineColumn } =
                    getLanguageSpecificColumns(selectedLanguage);
                  return (
                    <div
                      key={couplet.kno}
                      style={{
                        marginBottom: "1rem",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        const explanation = await fetchExplanation(
                          couplet.kno,
                          selectedLanguage
                        );
                        setSelectedCouplet({
                          ...couplet,
                          explanation,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Typography variant="subtitle1">
                        Kural {parseInt(couplet.kno)}
                      </Typography>
                      <Typography>{couplet[firstLineColumn] || ""}</Typography>
                      <Typography>{couplet[secondLineColumn] || ""}</Typography>
                    </div>
                  );
                })
              ) : (
                <Typography>Loading couplets...</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </List>
  );
}

export default AdhigaramList;
