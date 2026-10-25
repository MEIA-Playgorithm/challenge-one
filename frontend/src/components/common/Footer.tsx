import { Link, Typography } from "@mui/material";

const BLOG_URL = "https://playgorithm.blogspot.com";

// Rodapé da página: direitos e a ligação ao blog. Fica sobre a margem de baixo
// da página (16 px), por isso não tira altura ao resto.
const Footer = () => (
    <Typography component="footer" variant="caption" color="textSecondary" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", fontSize: 11, lineHeight: "16px", bgcolor: "background.default" }}>
        © 2026 Playgorithm ·{" "}
        <Link href={BLOG_URL} target="_blank" rel="noopener noreferrer" underline="hover">
            Blog
        </Link>
    </Typography>
);

export default Footer;
