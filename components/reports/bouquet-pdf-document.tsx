import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    orientation: "portrait",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  // Document Header
  headerContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#e11d48",
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#e11d48",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: "flex-end",
  },
  periodLabel: {
    fontSize: 7,
    color: "#9f1239",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  periodValue: {
    fontSize: 11,
    color: "#e11d48",
    fontFamily: "Helvetica-Bold",
    marginTop: 1,
  },
  summaryRow: {
    flexDirection: "row",
    marginTop: 8,
    backgroundColor: "#f9fafb",
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  summaryItem: {
    flex: 1,
    flexDirection: "column",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 1,
  },
  // Items Container
  cardsContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    padding: 10,
    flexDirection: "row",
    height: 200,
  },
  imageWrapper: {
    width: 220,
    height: 180,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImagePlaceholder: {
    fontSize: 9,
    color: "#9ca3af",
    fontFamily: "Helvetica",
    textAlign: "center",
    padding: 8,
  },
  metaWrapper: {
    flex: 1,
    marginLeft: 14,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  metaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 6,
    marginBottom: 6,
  },
  dateBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#e11d48",
  },
  itemIndexBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  metaFields: {
    flexDirection: "column",
    gap: 6,
  },
  metaFieldGroup: {
    flexDirection: "column",
  },
  fieldLabel: {
    fontSize: 7,
    color: "#6b7280",
    fontFamily: "Helvetica",
    textTransform: "uppercase",
  },
  fieldValueLocation: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    marginTop: 1,
  },
  fieldValueStaff: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#374151",
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  countText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTimestamp: {
    fontSize: 7,
    color: "#9ca3af",
  },
  archivedNotice: {
    fontSize: 7,
    color: "#d97706",
    fontFamily: "Helvetica-Bold",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 7,
    color: "#9ca3af",
  },
  footerPageNum: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
  },
});

export interface PdfBouquetItem {
  id: string;
  installDate: string;
  locationName: string;
  flowerCount: number;
  staffName: string;
  imageSrc?: string | null;
  isArchived: boolean;
  createdAt: string;
}

export interface BouquetReportDocumentProps {
  periodLabel: string; // e.g. "September 2026"
  printedAt: string;
  totalItems: number;
  totalFlowers: number;
  items: PdfBouquetItem[];
}

/**
 * Splits an array into chunks of a given size.
 */
function chunkArray<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export function BouquetReportDocument({
  periodLabel,
  printedAt,
  totalItems,
  totalFlowers,
  items,
}: BouquetReportDocumentProps) {
  // Enforce strictly 3 items per A4 sheet
  const pages = chunkArray(items, 3);

  return (
    <Document title={`Laporan Buket - ${periodLabel}`} author="B-Tracker Operations">
      {pages.map((pageItems, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          {/* Header on Every Page */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.brandTitle}>B-TRACKER OPERATIONS</Text>
                <Text style={styles.brandSubtitle}>
                  Laporan Dokumentasi Pemasangan Buket Lapangan
                </Text>
              </View>
              <View style={styles.periodBadge}>
                <Text style={styles.periodLabel}>PERIODE LAPORAN</Text>
                <Text style={styles.periodValue}>{periodLabel}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>TOTAL DOKUMENTASI</Text>
                <Text style={styles.summaryValue}>{totalItems} Pemasangan</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>TOTAL BUNGA (PCS)</Text>
                <Text style={styles.summaryValue}>{totalFlowers} Pcs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>WAKTU EXPORT</Text>
                <Text style={styles.summaryValue}>{printedAt}</Text>
              </View>
            </View>
          </View>

          {/* Items Container: Strictly 3 cards per sheet */}
          <View style={styles.cardsContainer}>
            {pageItems.map((item, itemIdx) => {
              const globalIndex = pageIdx * 3 + itemIdx + 1;
              return (
                <View key={item.id} style={styles.card} wrap={false}>
                  {/* Image Container */}
                  <View style={styles.imageWrapper}>
                    {item.imageSrc ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <Image style={styles.photo} src={item.imageSrc} />
                    ) : (
                      <Text style={styles.noImagePlaceholder}>
                        {item.isArchived
                          ? "Foto telah di-purge (diarsipkan untuk konservasi storage)"
                          : "Foto tidak tersedia"}
                      </Text>
                    )}
                  </View>

                  {/* Metadata Container */}
                  <View style={styles.metaWrapper}>
                    <View style={styles.metaHeader}>
                      <Text style={styles.dateBadge}>
                        Tanggal Pasang: {item.installDate}
                      </Text>
                      <Text style={styles.itemIndexBadge}>
                        Item #{globalIndex} dari {totalItems}
                      </Text>
                    </View>

                    <View style={styles.metaFields}>
                      <View style={styles.metaFieldGroup}>
                        <Text style={styles.fieldLabel}>Lokasi Pemasangan</Text>
                        <Text style={styles.fieldValueLocation}>
                          {item.locationName}
                        </Text>
                      </View>

                      <View style={styles.metaFieldGroup}>
                        <Text style={styles.fieldLabel}>Jumlah Bunga</Text>
                        <View style={styles.countBadge}>
                          <Text style={styles.countText}>
                            {item.flowerCount} Pcs
                          </Text>
                        </View>
                      </View>

                      <View style={styles.metaFieldGroup}>
                        <Text style={styles.fieldLabel}>Staf Pemasang</Text>
                        <Text style={styles.fieldValueStaff}>
                          {item.staffName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardTimestamp}>
                        ID Laporan: {item.id.slice(0, 8)}...
                      </Text>
                      {item.isArchived && (
                        <Text style={styles.archivedNotice}>
                          Penyimpanan: Foto Diarsipkan
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Footer on Every Page */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerBrand}>
              Dokumen Resmi B-Tracker Florist • Dicetak Otomatis
            </Text>
            <Text
              style={styles.footerPageNum}
              render={({ pageNumber, totalPages }) =>
                `Halaman ${pageNumber} dari ${totalPages}`
              }
            />
          </View>
        </Page>
      ))}
    </Document>
  );
}
