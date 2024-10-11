import React from "react";
import PropTypes from "prop-types";
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
  adhigaramID = 0,
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
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                {
                  (adhigaramID =
                    parseInt(chapters[title][heading + "Knos"][chapterIndex]) /
                    10)
                }
                . {getAdhigaramTranslation(chapter, selectedLanguage)}
              </Typography>
              <div style={{ marginLeft: "auto" }}>
                <audio
                  ref={(audio) => {
                    if (audio && selectedLanguage !== "Tamil") {
                      audio.currentTime = 20;
                    }
                  }}
                  src={`https://github.com/nsdevaraj/valluvan-assets/raw/refs/heads/asset-bucket/valluvan/${
                    selectedLanguage === "Tamil"
                      ? `Sounds/${encodeURIComponent(chapter)}.mp3`
                      : `EnglishAudio/${adhigaramID
                          .toString()
                          .padStart(3, "0")}.mp3`
                  }`}
                  controls
                  style={{ height: "30px" }}
                />
              </div>
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

AdhigaramList.propTypes = {
  chapters: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  expandedChapter: PropTypes.string,
  expandedChapters: PropTypes.object.isRequired,
  handleChapterClick: PropTypes.func.isRequired,
  fetchExplanation: PropTypes.func.isRequired,
  setSelectedCouplet: PropTypes.func.isRequired,
  setDialogOpen: PropTypes.func.isRequired,
  adhigaramID: PropTypes.number,
};

export default AdhigaramList;
