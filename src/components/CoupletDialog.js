import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { getHeadingTranslation } from "../utils/TranslationUtil";
import renderRelatedKurals from "./RelatedKurals";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

function CoupletDialog({
  open,
  onClose,
  selectedCouplet,
  selectedLanguage,
  relatedCouplets,
  getLanguageSpecificColumns,
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (selectedCouplet) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      setIsFavorite(favorites.includes(Number(selectedCouplet.kno)));
    }
  }, [selectedCouplet]);

  const handleFavoriteClick = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (kno) => kno !== parseInt(selectedCouplet.kno)
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push(parseInt(selectedCouplet.kno));
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  if (!selectedCouplet) {
    return null;
  }

  const coupletNumber = parseInt(selectedCouplet?.kno);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {!isNaN(coupletNumber) && (
        <>
          <DialogTitle>
            {getHeadingTranslation("Kural", selectedLanguage)} {coupletNumber}
            <IconButton
              onClick={handleFavoriteClick}
              style={{ marginLeft: "10px" }}
            >
              {isFavorite ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </DialogTitle>
          {selectedLanguage == "Tamil" && (
            <div style={{ marginLeft: "auto", width: "50%" }}>
              <audio
                src={`https://github.com/nsdevaraj/valluvan-assets/raw/refs/heads/asset-bucket/valluvan/Kural/${String(
                  coupletNumber
                )}.mp3`}
                controls
                style={{ height: "30px" }}
              />
            </div>
          )}
        </>
      )}
      <DialogContent>
        {selectedCouplet && (
          <>
            {!isNaN(coupletNumber) && (
              <Typography variant="h6">
                {selectedLanguage !== "Tamil" ? "Couplet:" : "குறள்:"}
              </Typography>
            )}
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
              {isNaN(coupletNumber) ? "Favorite Kurals:" : "Related Kurals:"}
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
