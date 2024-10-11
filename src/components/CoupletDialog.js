import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function CoupletDialog({
  open,
  onClose,
  selectedCouplet,
  selectedLanguage,
  relatedCouplets,
  getLanguageSpecificColumns,
}) {
  const renderRelatedKurals = (relatedCouplets) => {
    return relatedCouplets.map((couplet) => (
      <Accordion key={couplet.kno}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Kural {parseInt(couplet.kno)}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {
              couplet[
                getLanguageSpecificColumns(selectedLanguage).firstLineColumn
              ]
            }
          </Typography>
          <Typography>
            {
              couplet[
                getLanguageSpecificColumns(selectedLanguage).secondLineColumn
              ]
            }
          </Typography>
          <Typography variant="subtitle2" style={{ marginTop: "0.5rem" }}>
            Explanation:
          </Typography>
          <Typography>
            {couplet[getLanguageSpecificColumns(selectedLanguage).explanation]}
          </Typography>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Kural {parseInt(selectedCouplet?.kno)}</DialogTitle>
      <DialogContent>
        {selectedCouplet && (
          <>
            <Typography variant="h6">Couplet:</Typography>
            <Typography>
              {
                selectedCouplet[
                  getLanguageSpecificColumns(selectedLanguage).firstLineColumn
                ]
              }
            </Typography>
            <Typography>
              {
                selectedCouplet[
                  getLanguageSpecificColumns(selectedLanguage).secondLineColumn
                ]
              }
            </Typography>
            <Typography variant="h6" style={{ marginTop: "1rem" }}>
              {selectedLanguage === "Tamil" ||
              !selectedCouplet.explanation.explanation
                ? ""
                : "Explanation:"}
            </Typography>
            {selectedLanguage === "Tamil" ? (
              getLanguageSpecificColumns("Tamil").explanationColumns.map(
                (column) =>
                  selectedCouplet.explanation[column] && (
                    <div key={column}>
                      <Typography variant="subtitle1">{column}:</Typography>
                      <Typography>
                        {selectedCouplet.explanation[column]}
                      </Typography>
                    </div>
                  )
              )
            ) : (
              <Typography>{selectedCouplet.explanation.explanation}</Typography>
            )}
            <Typography variant="h6" style={{ marginTop: "1rem" }}>
              Related Kurals:
            </Typography>
            {renderRelatedKurals(relatedCouplets)}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CoupletDialog;
