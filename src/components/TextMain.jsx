import { Box, Typography } from "@mui/material";

const TextMain = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "100px",
        left: "65%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 800,
        color: "white",
        textAlign: "center",
        p: 3,
        borderRadius: 2,
      }}
    >
      
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
        <span style={{ color: "orange" }}>95%</span> of patients choose us again
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
       Take, pay, and track your tests <span style={{ color: "orange" }}>all in one place</span>
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 1}}>
      <span style={{ color: "orange" }}>CheckAI</span> powered analysis for every medical report
      </Typography>
    </Box>
  );
};

export default TextMain;   