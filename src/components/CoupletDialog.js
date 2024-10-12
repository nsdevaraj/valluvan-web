import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { getHeadingTranslation } from "../utils/TranslationUtil";
import renderRelatedKurals from "./RelatedKurals";

function CoupletDialog({
  open,
  onClose,
  selectedCouplet,
  selectedLanguage,
  relatedCouplets,
  getLanguageSpecificColumns,
}) {
  if (!selectedCouplet) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {getHeadingTranslation("Kural", selectedLanguage)}{" "}
        {parseInt(selectedCouplet?.kno)}
      </DialogTitle>

      <div style={{ marginLeft: "auto" }}>
        <audio
          src={`https://github.com/nsdevaraj/valluvan-assets/raw/refs/heads/asset-bucket/valluvan/Kural/${String(
            selectedCouplet?.kno
          )}.mp3`}
          controls
          style={{ height: "30px" }}
        />
      </div>
      <DialogContent>
        {selectedCouplet && (
          <>
            <Typography variant="h6">
              {selectedLanguage !== "Tamil" ? "Couplet:" : "குறள்:"}
            </Typography>
            <Typography>
              {selectedCouplet.couplet?.[
                getLanguageSpecificColumns(selectedLanguage).firstLineColumn
              ] ||
                selectedCouplet[
                  getLanguageSpecificColumns(selectedLanguage).firstLineColumn
                ]}
            </Typography>
            <Typography>
              {selectedCouplet.couplet?.[
                getLanguageSpecificColumns(selectedLanguage).secondLineColumn
              ] ||
                selectedCouplet[
                  getLanguageSpecificColumns(selectedLanguage).secondLineColumn
                ]}
            </Typography>
            <Typography variant="h6" style={{ marginTop: "1rem" }}>
              {selectedLanguage === "Tamil" ||
              !selectedCouplet.explanation.explanation
                ? ""
                : "Explanation:"}
            </Typography>
            {selectedLanguage === "Tamil" ? (
              getLanguageSpecificColumns(
                selectedLanguage
              ).explanationColumns.map(
                (column) =>
                  selectedCouplet.explanation[column] && (
                    <div key={column}>
                      <Typography variant="h6">
                        <br />
                        {getHeadingTranslation(column, selectedLanguage)}:
                      </Typography>
                      <Typography>
                        {selectedCouplet.explanation[column]}
                      </Typography>
                    </div>
                  )
              )
            ) : (
              <Typography>
                {selectedCouplet.explanation.explanation || "N/A"}
              </Typography>
            )}
            <Typography variant="h6" style={{ marginTop: "1rem" }}>
              Related Kurals:
            </Typography>
            {renderRelatedKurals(
              relatedCouplets,
              selectedLanguage,
              getLanguageSpecificColumns,
              selectedCouplet
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

CoupletDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCouplet: PropTypes.shape({
    kno: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    couplet: PropTypes.shape({
      firstLineColumn: PropTypes.string,
      secondLineColumn: PropTypes.string,
    }),
    explanation: PropTypes.shape({
      explanation: PropTypes.string,
    }),
  }),
  selectedLanguage: PropTypes.string.isRequired,
  relatedCouplets: PropTypes.array,
  getLanguageSpecificColumns: PropTypes.func.isRequired,
};

export default CoupletDialog;
