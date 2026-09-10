const ESCAPE = /<\/script/gi;

type JsonLdData = Record<string, unknown> | Record<string, unknown>[] | Array<Record<string, unknown> | null>;

export function JsonLd({ data }: { data: JsonLdData }) {
  const list = Array.isArray(data) ? data.filter(Boolean) : [data];
  const json = JSON.stringify(list.length === 1 ? list[0] : list).replace(ESCAPE, "<\\/script");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}