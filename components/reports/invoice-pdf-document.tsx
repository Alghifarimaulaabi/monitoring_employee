import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { InvoiceData, formatRupiah } from "@/lib/constants/invoice";
import { registerAppFonts } from "@/lib/pdf/font";

registerAppFonts();

const styles = StyleSheet.create({
  page: {
    size: "A4",
    orientation: "portrait",
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 44,
    fontFamily: "Roboto",
    fontSize: 9.5,
    color: "#000000",
    backgroundColor: "#ffffff",
    lineHeight: 1.35,
  },
  // Header / Kop Surat
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logoWrapper: {
    width: 65,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  logoImage: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  logoFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e11d48",
  },
  logoSubtext: {
    fontSize: 7,
    fontWeight: "bold",
    marginTop: 1,
    textAlign: "center",
  },
  headerTextWrapper: {
    flex: 1,
    textAlign: "center",
    paddingRight: 45, // balances the logo on the left
  },
  companyName: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8.5,
    marginBottom: 1.5,
  },
  companyContact: {
    fontSize: 8,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    marginBottom: 14,
  },

  // Date top right
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 9.5,
  },

  // Metadata Surat (Nomor, Perihal, Lampiran)
  metaContainer: {
    marginBottom: 14,
    flexDirection: "column",
    gap: 2.5,
  },
  metaRow: {
    flexDirection: "row",
  },
  metaLabel: {
    width: 65,
    fontSize: 9.5,
  },
  metaColon: {
    width: 12,
    fontSize: 9.5,
  },
  metaValue: {
    flex: 1,
    fontSize: 9.5,
  },

  // Recipient (Yth.)
  recipientContainer: {
    marginBottom: 14,
    flexDirection: "column",
    gap: 1.5,
  },
  recipientText: {
    fontSize: 9.5,
  },

  // Salutation & Body
  greetingText: {
    fontSize: 9.5,
    marginBottom: 6,
  },
  bodyParagraph: {
    fontSize: 9.5,
    marginBottom: 8,
    textAlign: "justify",
    lineHeight: 1.4,
  },

  // Bank Info Block
  bankBlock: {
    marginTop: 2,
    marginBottom: 12,
    marginLeft: 0,
    flexDirection: "column",
    gap: 2.5,
  },
  bankRow: {
    flexDirection: "row",
  },
  bankLabel: {
    width: 85,
    fontSize: 9.5,
  },
  bankColon: {
    width: 12,
    fontSize: 9.5,
  },
  bankValue: {
    flex: 1,
    fontSize: 9.5,
  },

  // Closing
  closingParagraph: {
    fontSize: 9.5,
    marginBottom: 20,
    textAlign: "justify",
    lineHeight: 1.4,
  },

  // Signature Block
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureWrapper: {
    width: 150,
    alignItems: "center",
  },
  signatureSalutation: {
    fontSize: 9.5,
    marginBottom: 38, // space for signature
  },
  signerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 1.5,
    textAlign: "center",
  },
  signerTitle: {
    fontSize: 9.5,
    textAlign: "center",
  },
});

interface InvoicePdfDocumentProps {
  data: InvoiceData;
  logoBase64?: string | null;
}

export function InvoicePdfDocument({ data, logoBase64 }: InvoicePdfDocumentProps) {
  const formattedAmount = formatRupiah(data.totalAmount);

  return (
    <Document title={`Surat Tagihan - ${data.letterNumber.replace(/\//g, "-")}`}>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* Header / Kop Surat */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            {logoBase64 ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoBase64} style={styles.logoImage} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>CA</Text>
              </View>
            )}
            <Text style={styles.logoSubtext}>CV. ALIZA</Text>
          </View>

          <View style={styles.headerTextWrapper}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.companyAddress}>{data.companyAddress}</Text>
            <Text style={styles.companyContact}>{data.companyContact}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* Tanggal Surat (Kanan Atas) */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{data.letterDate}</Text>
        </View>

        {/* Nomor, Perihal, Lampiran */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Nomor</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.letterNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Perihal</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.subject}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Lampiran</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.attachment}</Text>
          </View>
        </View>

        {/* Tujuan Surat (Yth.) */}
        <View style={styles.recipientContainer}>
          <Text style={styles.recipientText}>{data.recipientSalutation}</Text>
          {data.recipientTitle ? (
            <Text style={styles.recipientText}>{data.recipientTitle}</Text>
          ) : null}
          <Text style={styles.recipientText}>{data.recipientCompany}</Text>
          <Text style={styles.recipientText}>{data.recipientAddress}</Text>
          <Text style={styles.recipientText}>{data.recipientCity}</Text>
        </View>

        {/* Salam Pembuka */}
        <Text style={styles.greetingText}>{data.greeting}</Text>

        {/* Paragraf 1: Pengantar Layanan & Periode */}
        <Text style={styles.bodyParagraph}>
          Bersama ini kami sampaikan mengenai tagihan {data.serviceDescription}{" "}
          periode {data.periodStart} s/d {data.periodEnd}.
        </Text>

        {/* Paragraf 2: Nilai Tagihan & Terbilang */}
        <Text style={styles.bodyParagraph}>
          Adapun nilai tagihannya sebesar Rp. {formattedAmount}.- ( {data.terbilangAmount} )
        </Text>

        {/* Paragraf 3: Petunjuk Pembayaran */}
        <Text style={styles.bodyParagraph}>
          {data.paymentInstructions}
        </Text>

        {/* Info Rekening */}
        <View style={styles.bankBlock}>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Atas nama</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankAccountName}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>No rekening</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankAccountNumber}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Bank</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankName}</Text>
          </View>
        </View>

        {/* Paragraf Penutup */}
        <Text style={styles.closingParagraph}>
          {data.closingText}
        </Text>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureWrapper}>
            <Text style={styles.signatureSalutation}>
              {data.signatureSalutation}
            </Text>
            <Text style={styles.signerName}>{data.signerName}</Text>
            <Text style={styles.signerTitle}>{data.signerTitle}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
