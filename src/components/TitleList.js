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
  getTitlesByLanguage,
  getHeadingTranslation,
} from "../utils/TranslationUtil";
import AdhigaramList from "./AdhigaramList";

function TitleList({
  titles,
  headings,
  chapters,
  selectedLanguage,
  expandedTitle,
  expandedHeadings,
  expandedChapter,
  expandedChapters,
  handleTitleChange,
  handleHeadingChange,
  handleChapterClick,
  fetchExplanation,
  setSelectedCouplet,
  setDialogOpen,
}) {
  return (
    <div>
      {titles.map((title, index) => (
        <Accordion
          key={title}
          expanded={expandedTitle === title}
          onChange={handleTitleChange(title)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {headings[getTitlesByLanguage("Tamil")[index]] &&
            headings[getTitlesByLanguage("Tamil")[index]].length > 0 ? (
              <List>
                {headings[getTitlesByLanguage("Tamil")[index]].map(
                  (heading, headingIndex) => (
                    <Accordion
                      key={headingIndex}
                      expanded={
                        expandedHeadings[
                          getTitlesByLanguage("Tamil")[index]
                        ] === heading
                      }
                      onChange={handleHeadingChange(
                        getTitlesByLanguage("Tamil")[index],
                        heading
                      )}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                          {getHeadingTranslation(heading, selectedLanguage)}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {chapters[getTitlesByLanguage("Tamil")[index]] &&
                        chapters[getTitlesByLanguage("Tamil")[index]][
                          heading
                        ] ? (
                          <AdhigaramList
                            chapters={chapters}
                            title={getTitlesByLanguage("Tamil")[index]}
                            heading={heading}
                            selectedLanguage={selectedLanguage}
                            expandedChapter={expandedChapter}
                            expandedChapters={expandedChapters}
                            handleChapterClick={handleChapterClick}
                            fetchExplanation={fetchExplanation}
                            setSelectedCouplet={setSelectedCouplet}
                            setDialogOpen={setDialogOpen}
                          />
                        ) : (
                          <Typography>Loading chapters...</Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )
                )}
              </List>
            ) : (
              <Typography>No headings found for {title}</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default TitleList;
