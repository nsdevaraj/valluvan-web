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
  getTitlesByLanguage,
  getHeadingTranslation,
} from "../utils/TranslationUtil";
import AdhigaramList from "./AdhigaramList";
import {
  AttachMoney,
  Home,
  WcRounded,
  Book,
  Gavel,
  Spa,
  BakeryDining,
  CardTravel,
  Castle,
  AssuredWorkload,
  LocalFireDepartment,
  LocationCity,
  Celebration,
  Favorite,
  Chalet,
} from "@mui/icons-material";

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
            {index === 0 && <Gavel />}
            {index === 1 && <AttachMoney />}
            {index === 2 && <WcRounded />}
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
                        {index === 0 && headingIndex === 0 && <Book />}
                        {index === 0 && headingIndex === 1 && <Home />}
                        {index === 0 && headingIndex === 2 && <Spa />}
                        {index === 1 && headingIndex === 0 && (
                          <AssuredWorkload />
                        )}
                        {index === 1 && headingIndex === 1 && <CardTravel />}
                        {index === 1 && headingIndex === 2 && <Castle />}
                        {index === 1 && headingIndex === 3 && <BakeryDining />}
                        {index === 1 && headingIndex === 4 && (
                          <LocalFireDepartment />
                        )}
                        {index === 1 && headingIndex === 5 && <Celebration />}
                        {index === 1 && headingIndex === 6 && <LocationCity />}
                        {index === 2 && headingIndex === 0 && <Favorite />}
                        {index === 2 && headingIndex === 1 && <Chalet />}
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

TitleList.propTypes = {
  titles: PropTypes.array.isRequired,
  headings: PropTypes.object.isRequired,
  chapters: PropTypes.object.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  expandedTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  expandedHeadings: PropTypes.object.isRequired,
  expandedChapter: PropTypes.string,
  expandedChapters: PropTypes.object.isRequired,
  handleTitleChange: PropTypes.func.isRequired,
  handleHeadingChange: PropTypes.func.isRequired,
  handleChapterClick: PropTypes.func.isRequired,
  fetchExplanation: PropTypes.func.isRequired,
  setSelectedCouplet: PropTypes.func.isRequired,
  setDialogOpen: PropTypes.func.isRequired,
};

export default TitleList;
