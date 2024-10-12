import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getHeadingTranslation } from "../utils/TranslationUtil";

function renderRelatedKurals(
  relatedCouplets,
  selectedLanguage,
  getLanguageSpecificColumns,
  selectedCouplet
) {
  return relatedCouplets.map((couplet) => (
    <Accordion key={couplet.kno}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {getHeadingTranslation("Kural", selectedLanguage)}{" "}
          {parseInt(couplet.kno)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {selectedLanguage == "Tamil" && (
          <div style={{ marginLeft: "auto", width: "30%" }}>
            <audio
              src={`https://github.com/nsdevaraj/valluvan-assets/raw/refs/heads/asset-bucket/valluvan/Kural/${String(
                parseInt(couplet.kno)
              )}.mp3`}
              controls
              style={{ height: "30px" }}
            />
          </div>
        )}
        <Typography>
          {couplet[
            getLanguageSpecificColumns(selectedLanguage).firstLineColumn
          ] ||
            selectedCouplet[
              getLanguageSpecificColumns(selectedLanguage).firstLineColumn
            ]}
        </Typography>
        <Typography>
          {couplet[
            getLanguageSpecificColumns(selectedLanguage).secondLineColumn
          ] ||
            selectedCouplet[
              getLanguageSpecificColumns(selectedLanguage).secondLineColumn
            ]}
        </Typography>
        <Typography variant="body1" style={{ marginTop: "0.5rem" }}>
          <br />
          {getHeadingTranslation("Explanation", selectedLanguage)}
          {": "}
        </Typography>
        <Typography>
          {couplet[getLanguageSpecificColumns(selectedLanguage).explanation] ||
            selectedCouplet[
              getLanguageSpecificColumns(selectedLanguage).explanation
            ]}
        </Typography>
      </AccordionDetails>
    </Accordion>
  ));
}

export default renderRelatedKurals;
