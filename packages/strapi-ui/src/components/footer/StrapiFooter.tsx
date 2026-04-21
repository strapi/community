import { fetchFooter } from "../../api/fetch-footer";
import type { FooterMainData } from "../../types/footer";
import { StrapiFooterMain } from "./StrapiFooterMain";

export async function StrapiFooter() {
  const content = await fetchFooter();

  if (!content?.length) return null;

  return (
    <footer>
      {content.map((item) => {
        if (item.__component === "footer.footer-main") {
          return (
            <StrapiFooterMain
              key={item.id}
              component={item as FooterMainData}
            />
          );
        }
        return null;
      })}
    </footer>
  );
}
